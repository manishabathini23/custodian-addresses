import { useState, useMemo } from "react";
import { mockCustomers, mockAddresses } from "@/data/mockData";
import { CustomerCard } from "@/components/CustomerCard";
import { CustomerForm } from "@/components/CustomerForm";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerList() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [addresses, setAddresses] = useState(mockAddresses);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { toast } = useToast();

  // Get unique cities and states for filters
  const { cities, states } = useMemo(() => {
    const uniqueCities = [...new Set(addresses.map(addr => addr.city))].sort();
    const uniqueStates = [...new Set(addresses.map(addr => addr.state))].sort();
    return { cities: uniqueCities, states: uniqueStates };
  }, [addresses]);

  // Filter customers based on search and filter criteria
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = searchTerm === "" || 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm);

      const customerAddresses = addresses.filter(addr => addr.customerId === customer.id);
      
      const matchesCity = cityFilter === "" || cityFilter === "all" ||
        customerAddresses.some(addr => addr.city === cityFilter);
      
      const matchesState = stateFilter === "" || stateFilter === "all" ||
        customerAddresses.some(addr => addr.state === stateFilter);

      return matchesSearch && matchesCity && matchesState;
    });
  }, [customers, addresses, searchTerm, cityFilter, stateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveCustomer = (customerData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id 
          ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
          : customer
      ));
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });
    } else {
      // Add new customer
      const newCustomer = {
        id: Date.now().toString(),
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCustomers(prev => [newCustomer, ...prev]);
      toast({
        title: "Customer Created",
        description: "New customer has been successfully added.",
      });
    }
    
    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer? This will also delete all associated addresses.")) {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      setAddresses(prev => prev.filter(addr => addr.customerId !== customerId));
      toast({
        title: "Customer Deleted",
        description: "Customer and all associated addresses have been deleted.",
        variant: "destructive"
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setStateFilter("");
    setCurrentPage(1);
  };

  const getCustomerAddresses = (customerId) => {
    return addresses.filter(addr => addr.customerId === customerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Customer Management
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your customers and their addresses efficiently
              </p>
            </div>
            <Button 
              onClick={() => setShowCustomerForm(true)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-card border border-border/40 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-card border border-border/40 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Addresses</p>
                  <p className="text-2xl font-bold text-foreground">{addresses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-card border border-border/40 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold text-foreground">{filteredCustomers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            stateFilter={stateFilter}
            onStateFilterChange={setStateFilter}
            onClearFilters={handleClearFilters}
            cities={cities}
            states={states}
          />
        </div>

        {/* Customer Grid */}
        <div className="space-y-6">
          {paginatedCustomers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    addresses={getCustomerAddresses(customer.id)}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-gradient-primary" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-card border border-border/40 rounded-lg p-8 max-w-md mx-auto">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || cityFilter || stateFilter 
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first customer."
                  }
                </p>
                {(searchTerm || cityFilter || stateFilter) && (
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <CustomerForm
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => {
              setShowCustomerForm(false);
              setEditingCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
}