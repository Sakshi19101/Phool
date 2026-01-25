import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CustomerDetailsFormProps {
  onSubmit: (details: CustomerDetails) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export const CustomerDetailsForm = ({ onSubmit, onCancel, loading = false, error }: CustomerDetailsFormProps) => {
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const [formErrors, setFormErrors] = useState<Partial<CustomerDetails>>({});

  const validateForm = (): boolean => {
    const errors: Partial<CustomerDetails> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Phone must be 10 digits';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CustomerDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-pink-200">
      <CardHeader>
        <CardTitle className="text-pink-600">Customer Details</CardTitle>
        <p className="text-pink-500">Please provide your shipping information</p>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-pink-600">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-pink-600">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-pink-600">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-pink-600">Country *</Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.country && (
                <p className="text-red-500 text-sm">{formErrors.country}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-pink-600">Street Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street, Apartment 4B"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
            />
            {formErrors.address && (
              <p className="text-red-500 text-sm">{formErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-pink-600">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.city && (
                <p className="text-red-500 text-sm">{formErrors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-pink-600">State *</Label>
              <Input
                id="state"
                type="text"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.state && (
                <p className="text-red-500 text-sm">{formErrors.state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip" className="text-pink-600">ZIP Code *</Label>
              <Input
                id="zip"
                type="text"
                placeholder="400001"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
              {formErrors.zip && (
                <p className="text-red-500 text-sm">{formErrors.zip}</p>
              )}
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-pink-200 text-pink-500 hover:bg-pink-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
