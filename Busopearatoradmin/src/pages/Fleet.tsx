import { Link } from "react-router-dom";
import {
  BarChart,
  Bus,
  Edit,
  FileDown,
  Filter,
  GaugeCircle,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const busData = [
  {
    id: "BUS001",
    regNumber: "DL-01-BH-1234",
    type: "Luxury",
    capacity: 48,
    manufacturer: "Volvo",
    model: "9400XL",
    year: 2020,
    mileage: "125,000 km",
    lastMaintenance: "2023-10-15",
    nextMaintenance: "2023-12-15",
    status: "active",
    fuelEfficiency: "4.5 km/l",
    assignedRoute: "Delhi to Mumbai Express",
    driver: "John Smith",
    condition: 85,
  },
  {
    id: "BUS002",
    regNumber: "DL-01-BH-5678",
    type: "Sleeper",
    capacity: 36,
    manufacturer: "Scania",
    model: "Metrolink",
    year: 2019,
    mileage: "180,000 km",
    lastMaintenance: "2023-09-20",
    nextMaintenance: "2023-11-20",
    status: "active",
    fuelEfficiency: "4.2 km/l",
    assignedRoute: "Kolkata to Hyderabad",
    driver: "Amit Patel",
    condition: 78,
  },
  {
    id: "BUS003",
    regNumber: "DL-01-BH-9012",
    type: "Standard",
    capacity: 56,
    manufacturer: "Ashok Leyland",
    model: "Viking",
    year: 2018,
    mileage: "210,000 km",
    lastMaintenance: "2023-11-05",
    nextMaintenance: "2024-01-05",
    status: "active",
    fuelEfficiency: "5.1 km/l",
    assignedRoute: "Bangalore to Chennai",
    driver: "Rajesh Kumar",
    condition: 72,
  },
  {
    id: "BUS004",
    regNumber: "DL-01-BH-3456",
    type: "Deluxe",
    capacity: 40,
    manufacturer: "Volvo",
    model: "9400",
    year: 2021,
    mileage: "85,000 km",
    lastMaintenance: "2023-10-25",
    nextMaintenance: "2023-12-25",
    status: "active",
    fuelEfficiency: "4.8 km/l",
    assignedRoute: "Pune to Goa Coastal",
    driver: "Michael Brown",
    condition: 90,
  },
  {
    id: "BUS005",
    regNumber: "DL-01-BH-7890",
    type: "AC Sleeper",
    capacity: 32,
    manufacturer: "Scania",
    model: "Metrolink HD",
    year: 2020,
    mileage: "110,000 km",
    lastMaintenance: "2023-11-10",
    nextMaintenance: "2024-01-10",
    status: "maintenance",
    fuelEfficiency: "4.3 km/l",
    assignedRoute: "Jaipur to Delhi",
    driver: "Priya Sharma",
    condition: 65,
  },
];

const maintenanceData = [
  {
    id: "M001",
    busId: "BUS002",
    regNumber: "DL-01-BH-5678",
    date: "2023-09-20",
    type: "Regular",
    description: "Oil change, brake inspection, and fluid top-up",
    cost: "$350",
    technicianName: "Robert Wilson",
    parts: ["Oil filter", "Air filter", "Brake pads"],
    nextScheduled: "2023-11-20",
  },
  {
    id: "M002",
    busId: "BUS001",
    regNumber: "DL-01-BH-1234",
    date: "2023-10-15",
    type: "Regular",
    description: "Tire rotation, alignment, and AC service",
    cost: "$420",
    technicianName: "David Miller",
    parts: ["AC filter", "Wiper blades"],
    nextScheduled: "2023-12-15",
  },
  {
    id: "M003",
    busId: "BUS003",
    regNumber: "DL-01-BH-9012",
    date: "2023-11-05",
    type: "Major",
    description: "Engine overhaul and suspension work",
    cost: "$1,250",
    technicianName: "Jennifer Adams",
    parts: ["Engine gasket", "Suspension bushings", "Shock absorbers"],
    nextScheduled: "2024-01-05",
  },
  {
    id: "M004",
    busId: "BUS005",
    regNumber: "DL-01-BH-7890",
    date: "2023-11-10",
    type: "Emergency",
    description: "Clutch replacement and transmission repair",
    cost: "$850",
    technicianName: "Thomas Johnson",
    parts: ["Clutch plate", "Pressure plate", "Release bearing"],
    nextScheduled: "2024-01-10",
  },
  {
    id: "M005",
    busId: "BUS004",
    regNumber: "DL-01-BH-3456",
    date: "2023-10-25",
    type: "Regular",
    description: "Full service and safety inspection",
    cost: "$380",
    technicianName: "Sarah Williams",
    parts: ["Oil filter", "Fuel filter", "Air filter"],
    nextScheduled: "2023-12-25",
  },
];

const getConditionColor = (condition: number) => {
  if (condition >= 85) return "text-green-500";
  if (condition >= 70) return "text-amber-500";
  if (condition >= 50) return "text-orange-500";
  return "text-red-500";
};

const getProgressColor = (condition: number) => {
  if (condition >= 85) return "bg-green-500";
  if (condition >= 70) return "bg-amber-500";
  if (condition >= 50) return "bg-orange-500";
  return "bg-red-500";
};

const Fleet = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground mt-1">Manage your buses and maintenance schedules</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-zippy-purple hover:bg-zippy-darkPurple">
            <Plus className="mr-2 h-4 w-4" />
            Add New Bus
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Bus className="h-5 w-5 mr-2 text-zippy-purple" />
                Total Buses
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <GaugeCircle className="h-5 w-5 mr-2 text-green-500" />
                Active
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-amber-500" />
                Maintenance
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-red-500" />
                Issues
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="buses" className="space-y-6">
        <TabsList className="bg-zippy-gray">
          <TabsTrigger value="buses">Buses</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="analytics">Fleet Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buses">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search buses..." 
                  className="bg-zippy-darkGray border-zippy-gray pl-8"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-zippy-darkGray border-zippy-gray">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-zippy-darkGray border-zippy-gray">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="sleeper">Sleeper</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="acSleeper">AC Sleeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zippy-gray">
                    <TableRow>
                      <TableHead>Bus ID</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Assigned Route</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {busData.map((bus) => (
                      <TableRow key={bus.id} className="border-b border-zippy-gray">
                        <TableCell className="font-medium">{bus.id}</TableCell>
                        <TableCell>{bus.regNumber}</TableCell>
                        <TableCell>{bus.type}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{bus.manufacturer}</span>
                            <span className="text-xs text-muted-foreground">
                              {bus.model} ({bus.year})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{bus.assignedRoute}</TableCell>
                        <TableCell>{bus.driver}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={bus.condition} 
                              className={`h-2 w-16 ${getProgressColor(bus.condition)}`}
                            />
                            <span className={getConditionColor(bus.condition)}>
                              {bus.condition}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              bus.status === "active" 
                                ? "outline" 
                                : bus.status === "maintenance" 
                                ? "secondary" 
                                : "destructive"
                            }
                            className={
                              bus.status === "active"
                                ? "border-green-500 text-green-500"
                                : bus.status === "maintenance"
                                ? "border-amber-500 text-amber-500"
                                : ""
                            }
                          >
                            {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zippy-darkGray border-zippy-gray">
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Info className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Wrench className="mr-2 h-4 w-4" />
                                <span>Schedule Maintenance</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <User className="mr-2 h-4 w-4" />
                                <span>Assign Driver</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Remove from Fleet</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search records..." 
                  className="bg-zippy-darkGray border-zippy-gray pl-8"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-zippy-darkGray border-zippy-gray">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-zippy-darkGray border-zippy-gray">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-zippy-purple hover:bg-zippy-darkPurple">
              <Plus className="mr-2 h-4 w-4" />
              Add Maintenance Record
            </Button>
          </div>
          
          <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zippy-gray">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceData.map((record) => (
                      <TableRow key={record.id} className="border-b border-zippy-gray">
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{record.busId}</span>
                            <span className="text-xs text-muted-foreground">{record.regNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              record.type === "Regular"
                                ? "border-green-500 text-green-500"
                                : record.type === "Major"
                                ? "border-amber-500 text-amber-500"
                                : "border-red-500 text-red-500"
                            }
                          >
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{record.description}</div>
                        </TableCell>
                        <TableCell>{record.cost}</TableCell>
                        <TableCell>{record.technicianName}</TableCell>
                        <TableCell>{record.nextScheduled}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zippy-darkGray border-zippy-gray">
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Info className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Record</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Update Parts</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Record</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-3">
              <CardHeader>
                <CardTitle>Fleet Health Overview</CardTitle>
                <CardDescription>
                  Overall condition and statistics of your fleet
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 bg-zippy-gray flex items-center justify-center rounded-md">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Fleet analytics charts will be displayed here</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-2">
              <CardHeader>
                <CardTitle>Maintenance Cost Breakdown</CardTitle>
                <CardDescription>
                  Costs by category and bus
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 bg-zippy-gray flex items-center justify-center rounded-md">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Maintenance cost charts will be displayed here</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>
                  Scheduled in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {busData
                    .filter((bus) => new Date(bus.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                    .map((bus) => (
                      <div key={bus.id} className="flex items-start space-x-3 border-b border-zippy-gray pb-4">
                        <div className="bg-zippy-gray p-2 rounded-full mt-0.5">
                          <Wrench className="h-4 w-4 text-zippy-purple" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {bus.id} - {bus.regNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {bus.nextMaintenance}
                          </div>
                          <div className="flex items-center mt-1">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-zippy-gray">
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fleet;
