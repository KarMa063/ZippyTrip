
import { supabase } from "@/integrations/supabase/client";
import { ValidTableName, isValidTableName } from "@/utils/tableTypes";

// Function to enable realtime for a table
export const enableRealtimeForTable = async (tableName: string) => {
  try {
    // Validate the table name
    if (!isValidTableName(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return false;
    }
    
    // Convert to valid table name for type safety
    const validTableName = tableName as ValidTableName;
    
    // First, make the table replica identity full to get complete data in changes
    const { error: replicaError } = await supabase.rpc(
      'set_postgres_replica_identity_full' as any, 
      { table_name: validTableName }
    );
    
    if (replicaError) {
      console.warn(`Error setting replica identity for ${tableName}:`, replicaError);
    }
    
    // Then add the table to the realtime publication
    const { error } = await supabase.rpc(
      'add_to_realtime_publication' as any, 
      { table_name: validTableName }
    );
    
    if (error) {
      console.warn(`Error adding ${tableName} to realtime publication:`, error);
      return false;
    }
    
    console.log(`Realtime enabled for table: ${tableName}`);
    return true;
  } catch (err) {
    console.error(`Error enabling realtime for ${tableName}:`, err);
    return false;
  }
};

// Enable real-time updates for tables
export const enableRealtimeUpdates = () => {
  return supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, payload => {
      console.log('Routes change received!', payload);
      return payload;
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'buses' }, payload => {
      console.log('Buses change received!', payload);
      return payload;
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
      console.log('Schedules change received!', payload);
      return payload;
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
      console.log('Bookings change received!', payload);
      return payload;
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellation_notifications' }, payload => {
      console.log('Cancellation notifications change received!', payload);
      return payload;
    })
    .subscribe();
};
