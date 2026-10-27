import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Phone, User, Edit } from 'lucide-react';
import addressService from '../services/addressService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().regex(/^[0-9+ -]{8,15}$/, 'Please enter a valid phone number (at least 8 to 15 digits)'),
  addressLine1: z.string().trim().min(3, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().regex(/^[0-9]{6}$/, 'Postal code must be exactly 6 digits'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().default(false),
});

const AddressesPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    },
  });

  // Save address mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingAddress) {
        return addressService.updateAddress(editingAddress._id, data);
      }
      return addressService.createAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(editingAddress ? 'Address updated.' : 'New address added.');
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save address.');
    },
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.info('Address removed.');
      setDeleteConfirmId(null);
    },
  });

  // Set default mutation
  const defaultMutation = useMutation({
    mutationFn: addressService.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default delivery address updated.');
    },
  });

  const handleOpenCreate = () => {
    setEditingAddress(null);
    reset({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-sans">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage your delivery locations for fast, carbon-neutral checkout.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
          Add New Address
        </Button>
      </div>

      {/* Address Cards List */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-sand-300 p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest-950">No saved addresses yet</h3>
          <p className="text-xs text-charcoal-muted max-w-xs">
            Add a shipping address so you can quickly checkout your circular orders.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate} className="mt-2">
            Add Shipping Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-6 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between gap-4 ${
                addr.isDefault
                  ? 'border-forest-800 shadow-medium ring-2 ring-forest-800/10'
                  : 'border-sand-200 shadow-soft hover:shadow-medium'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-forest-800" />
                    <span className="text-sm font-bold text-forest-950">{addr.fullName}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-charcoal-muted flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{addr.phone}</span>
                </div>

                <div className="text-xs text-charcoal leading-relaxed mt-2 pt-2 border-t border-sand-100">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="font-semibold text-forest-900">{addr.country}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-sand-100 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => defaultMutation.mutate(addr._id)}
                    className="font-bold text-forest-800 hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Primary
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="text-charcoal-light hover:text-forest-800 transition-colors"
                    aria-label="Edit address"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(addr._id)}
                    className="text-charcoal-light hover:text-red-600 transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit((d) => saveMutation.mutateAsync(d))} className="flex flex-col gap-4">
          <Input
            label="Recipient Full Name"
            placeholder="Maya Sharma"
            error={errors.fullName?.message}
            required
            {...register('fullName')}
          />

          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />

          <Input
            label="Address Line 1"
            placeholder="Flat / House No., Street, Area"
            error={errors.addressLine1?.message}
            required
            {...register('addressLine1')}
          />

          <Input
            label="Address Line 2 (Optional)"
            placeholder="Landmark, Apartment Name"
            error={errors.addressLine2?.message}
            {...register('addressLine2')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Bengaluru"
              error={errors.city?.message}
              required
              {...register('city')}
            />
            <Input
              label="State"
              placeholder="Karnataka"
              error={errors.state?.message}
              required
              {...register('state')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Postal Code (PIN)"
              placeholder="560001"
              maxLength={6}
              error={errors.postalCode?.message}
              required
              {...register('postalCode')}
            />
            <Input
              label="Country"
              defaultValue="India"
              readOnly
              {...register('country')}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal pt-1 select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-sand-300 text-forest-800 focus:ring-forest-600"
              {...register('isDefault')}
            />
            <span>Set as default delivery address</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-100">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingAddress ? 'Save Changes' : 'Add Address'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(deleteConfirmId)}
        title="Delete Address"
        message="Are you sure you want to remove this delivery address from your account?"
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AddressesPage;
