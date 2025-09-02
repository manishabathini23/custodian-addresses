import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Customer, Address, mockCustomers, mockAddresses } from "@/data/mockData";
import { AddressCard } from "@/components/AddressCard";
import { AddressForm } from "@/components/AddressForm";
import { CustomerForm } from "@/components/CustomerForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Phone, Calendar, Edit, Trash2, User, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const customer = customers.find(c => c.id === id);
  const customerAddresses = addresses.filter(addr => addr.customerId === id);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Customer Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested customer could not be found.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer List
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setCustomers(prev => prev.map(c => 
      c.id === customer.id 
        ? { ...c, ...customerData, updatedAt: new Date().toISOString() }
        : c
    ));
    setShowCustomerForm(false);
    toast({
      title: "Customer Updated",
      description: "Customer information has been successfully updated.",
    });
  };

  const handleDeleteCustomer = () => {
    if (window.confirm("Are you sure you want to delete this customer? This will also delete all associated addresses.")) {
      toast({
        title: "Customer Deleted",
        description: "Customer and all associated addresses have been deleted.",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const handleSaveAddress = (addressData: Omit<Address, 'id'>) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...addressData }
          : addr
      ));
      toast({
        title: "Address Updated",
        description: "Address has been successfully updated.",
      });
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...addressData
      };
      setAddresses(prev => [...prev, newAddress]);
      toast({
        title: "Address Added",
        description: "New address has been successfully added.",
      });
    }
    
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({
        title: "Address Deleted",
        description: "Address has been successfully deleted.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.customerId === customer.id ? addr.id === addressId : addr.isDefault
    })));
    toast({
      title: "Default Address Updated",
      description: "Default address has been successfully updated.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" className="hover:border-primary/50">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Link>
            </Button>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-lg text-muted-foreground">Customer Details & Addresses</p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCustomerForm(true)}
                variant="outline"
                className="hover:border-primary/50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
              <Button 
                onClick={handleDeleteCustomer}
                variant="outline"
                className="hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/40 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg font-semibold text-foreground">
                      {customer.firstName} {customer.lastName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block">Phone Number</label>
                      <p className="text-foreground">{customer.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block">Created</label>
                      <p className="text-foreground">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                  
                  {customer.updatedAt !== customer.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground block">Last Updated</label>
                        <p className="text-foreground">{formatDate(customer.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Address Count</span>
                    <Badge variant={customerAddresses.length === 1 ? "warning" : "success"}>
                      {customerAddresses.length === 1 ? "Single Address" : `${customerAddresses.length} Addresses`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Addresses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Addresses</h2>
                <Badge variant="outline" className="ml-2">
                  {customerAddresses.length} {customerAddresses.length === 1 ? 'Address' : 'Addresses'}
                </Badge>
              </div>
              
              <Button 
                onClick={() => setShowAddressForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>

            <div className="space-y-4">
              {customerAddresses.length > 0 ? (
                customerAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))
              ) : (
                <Card className="bg-gradient-card border-border/40">
                  <CardContent className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No addresses found</h3>
                    <p className="text-muted-foreground mb-4">
                      This customer doesn't have any addresses yet.
                    </p>
                    <Button 
                      onClick={() => setShowAddressForm(true)}
                      className="bg-gradient-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Address
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Forms */}
        {showCustomerForm && (
          <CustomerForm
            customer={customer}
            onSave={handleUpdateCustomer}
            onCancel={() => setShowCustomerForm(false)}
          />
        )}

        {showAddressForm && (
          <AddressForm
            address={editingAddress || undefined}
            customerId={customer.id}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
          />
        )}
      </div>
    </div>
  );
}