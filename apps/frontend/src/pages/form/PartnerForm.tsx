// pages/PartnerForm.tsx

import React, { useState } from 'react';
import { Users, User, Truck } from 'lucide-react';
import { Input, Textarea, Button, Card, PageHeader, ToggleButtonGroup } from '../../components/shared';
import { PartnerFormProps, PartnerFormData, ValidationErrors, PartnerType } from '../../types';

const PartnerForm: React.FC<PartnerFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [partnerType, setPartnerType] = useState<PartnerType>(
    initialData?.type || PartnerType.CLIENT
  );
  const [formData, setFormData] = useState<Omit<PartnerFormData, 'type'>>({
    code: initialData?.code || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    taxId: initialData?.taxId || '',
    creditLimit: initialData?.creditLimit || ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Le code doit contenir au moins 2 caractères';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.phone && formData.phone.length < 8) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (formData.creditLimit) {
      const limit = parseFloat(formData.creditLimit);
      if (isNaN(limit) || limit < 0) {
        newErrors.creditLimit = 'La limite de crédit doit être un nombre positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit: PartnerFormData = {
        ...formData,
        type: partnerType
      };

      if (onSubmit) {
        await onSubmit(dataToSubmit);
      } else {
        console.log('Partner data:', dataToSubmit);
        alert(`${partnerType === 'client' ? 'Client' : 'Fournisseur'} créé avec succès!`);
      }

      // Reset form
      setFormData({
        code: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        creditLimit: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting partner:', error);
      alert('Une erreur est survenue lors de la création du partenaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      setFormData({
        code: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        creditLimit: ''
      });
      setErrors({});
    }
  };

  const partnerTypeOptions = [
    {
      value: 'client',
      label: 'Client',
      icon: <User size={24} />,
      color: 'from-blue-600 to-blue-700'
    },
    {
      value: 'supplier',
      label: 'Fournisseur',
      icon: <Truck size={24} />,
      color: 'from-green-600 to-green-700'
    }
  ];

  return (
    <Card>
      <PageHeader
        icon={Users}
        title="Créer un Partenaire"
        subtitle="Ajoutez un nouveau client ou fournisseur"
        iconColor="from-blue-500 to-blue-600"
      />

      <div className="mb-8">
        <ToggleButtonGroup
          options={partnerTypeOptions}
          value={partnerType}
          onChange={(value) => setPartnerType(value as PartnerType)}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Input
          label="Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="P001"
          required
          error={errors.code}
          disabled={isSubmitting}
        />

        <Input
          label="Nom"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nom du partenaire"
          required
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          error={errors.email}
          disabled={isSubmitting}
        />

        <Input
          label="Téléphone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+261 XX XX XXX XX"
          error={errors.phone}
          disabled={isSubmitting}
        />

        <div className="col-span-2">
          <Textarea
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Adresse complète"
            disabled={isSubmitting}
          />
        </div>

        <Input
          label="NIF/STAT"
          value={formData.taxId}
          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          placeholder="Numéro fiscal"
          disabled={isSubmitting}
        />

        {partnerType === 'client' && (
          <Input
            label="Limite de crédit"
            type="number"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
            placeholder="0.00"
            error={errors.creditLimit}
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Créer {partnerType === 'client' ? 'Client' : 'Fournisseur'}
        </Button>
      </div>
    </Card>
  );
};

export default PartnerForm;