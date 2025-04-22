
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ValidTableName, isValidTableName } from '@/utils/tableTypes';

type FetchFunction<T> = () => Promise<T[]>;

export function useRealtime<T>(
  table: ValidTableName | string,
  initialData: T[] = [],
  columns: string[] = ['*'],
  fetchFunction?: FetchFunction<T>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Convert table to a validated table name
  const validatedTable = typeof table === 'string' ? 
    (isValidTableName(table) ? table : null) : 
    table;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedData: T[];
        
        if (fetchFunction) {
          fetchedData = await fetchFunction();
        } else {
          // Only query if we have a valid table name
          if (!validatedTable) {
            throw new Error(`Invalid table name: ${table}`);
          }
          
          // Cast to ValidTableName for type safety with Supabase
          const safeTable = validatedTable as ValidTableName;
          
          const { data: supabaseData, error: supabaseError } = await supabase
            .from(safeTable)
            .select(columns.join(','));
          
          if (supabaseError) throw supabaseError;
          fetchedData = supabaseData as T[];
        }
        
        setData(fetchedData);
      } catch (err) {
        console.error(`Error fetching data from ${table}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [validatedTable, columns.join(','), fetchFunction]);

  // Set up real-time subscription
  useEffect(() => {
    if (!validatedTable) {
      console.warn(`Skipping realtime setup for invalid table: ${table}`);
      return;
    }
    
    // Enable Realtime for the table if not already enabled
    const enableRealtimeForTable = async () => {
      try {
        console.log(`Enabling realtime for table: ${validatedTable}`);
        
        // Cast to ValidTableName for type safety
        const safeTable = validatedTable as ValidTableName;
        
        await supabase.rpc('enable_realtime_for_table' as any, { 
          table_name: safeTable 
        });
      } catch (error) {
        console.warn(`Error enabling realtime for ${validatedTable}:`, error);
        // Continue anyway as the table might already be enabled
      }
    };

    enableRealtimeForTable();
    
    // Create a new real-time channel
    const setupRealtimeSubscription = () => {
      if (!validatedTable) return null;
      
      const channelName = `public:${validatedTable}`;
      console.log(`Setting up real-time subscription to ${channelName}`);
      
      // Cast to ValidTableName for type safety
      const safeTable = validatedTable as ValidTableName;
      
      const newChannel = supabase
        .channel(channelName)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public',
          table: safeTable
        }, payload => {
          console.log(`Real-time update received for ${validatedTable}:`, payload);
          
          const handleChange = async () => {
            try {
              // Fetch the latest data
              if (fetchFunction) {
                const freshData = await fetchFunction();
                setData(freshData);
              } else {
                const safeTableForQuery = validatedTable as ValidTableName;
                const { data: supabaseData, error: supabaseError } = await supabase
                  .from(safeTableForQuery)
                  .select(columns.join(','));
                
                if (supabaseError) throw supabaseError;
                setData(supabaseData as T[]);
              }
            } catch (err) {
              console.error(`Error updating data after real-time event on ${validatedTable}:`, err);
            }
          };
          
          handleChange();
        })
        .subscribe(status => {
          console.log(`Real-time subscription to ${validatedTable} status:`, status);
        });
      
      return newChannel;
    };
    
    const newChannel = setupRealtimeSubscription();
    setChannel(newChannel);
    
    // Cleanup subscription on unmount
    return () => {
      if (newChannel) {
        console.log(`Removing real-time subscription to ${validatedTable}`);
        supabase.removeChannel(newChannel);
      }
    };
  }, [validatedTable, columns.join(','), fetchFunction]);

  // Expose reload function for manual refresh
  const reload = async () => {
    setLoading(true);
    try {
      let freshData: T[];
      
      if (fetchFunction) {
        freshData = await fetchFunction();
      } else {
        if (!validatedTable) {
          throw new Error(`Invalid table name: ${table}`);
        }
        
        // Cast to ValidTableName for type safety
        const safeTable = validatedTable as ValidTableName;
        
        const { data: supabaseData, error: supabaseError } = await supabase
          .from(safeTable)
          .select(columns.join(','));
        
        if (supabaseError) throw supabaseError;
        freshData = supabaseData as T[];
      }
      
      setData(freshData);
    } catch (err) {
      console.error(`Error reloading data from ${table}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload };
}
