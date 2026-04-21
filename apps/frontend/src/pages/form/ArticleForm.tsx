// pages/ArticleForm.tsx
import React, { useState } from 'react';
import { Package, FolderTree } from 'lucide-react';
import { Input, Textarea, Button, Card, PageHeader, CustomSelect } from '../../components/shared';

interface CategoryOption {
  value: string;
  label: string;
}

interface ArticleFormData {
  code: string;
  name: string;
  description: string;
  purchasePrice: string;
  sellingPrice: string;
  stockMin: string;
  stockMax: string;
  currentStock: string;
  unit: string;
  barcode: string;
  categoryId: string;
}

interface FormErrors {
  code?: string;
  name?: string;
  purchasePrice?: string;
  sellingPrice?: string;
}

interface ArticleFormProps {
  onSubmit?: (data: ArticleFormData) => void;
  onCancel?: () => void;
  categories?: CategoryOption[];
}

const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, onCancel, categories = [] }) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    code: '',
    name: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    stockMin: '0',
    stockMax: '',
    currentStock: '0',
    unit: '',
    barcode: '',
    categoryId: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Default categories if none provided
  const defaultCategories: CategoryOption[] = [
    { value: '1', label: 'Électronique' },
    { value: '2', label: 'Alimentation' },
    { value: '3', label: 'Fournitures' }
  ];

  const categoryOptions = categories.length > 0 ? categories : defaultCategories;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.code) newErrors.code = 'Le code est requis';
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Le prix d\'achat est requis';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Le prix de vente est requis';
    if (parseFloat(formData.sellingPrice) < parseFloat(formData.purchasePrice)) {
      newErrors.sellingPrice = 'Le prix de vente doit être supérieur au prix d\'achat';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validate()) return;

    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Article data:', formData);
      alert('Article créé avec succès!');
    }

    // Reset form
    setFormData({
      code: '',
      name: '',
      description: '',
      purchasePrice: '',
      sellingPrice: '',
      stockMin: '0',
      stockMax: '',
      currentStock: '0',
      unit: '',
      barcode: '',
      categoryId: ''
    });
    setErrors({});
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        purchasePrice: '',
        sellingPrice: '',
        stockMin: '0',
        stockMax: '',
        currentStock: '0',
        unit: '',
        barcode: '',
        categoryId: ''
      });
      setErrors({});
    }
  };

  return (
    <Card>
      <PageHeader
        icon={Package}
        title="Créer un Article"
        subtitle="Ajoutez un nouveau produit à votre inventaire"
        iconColor="from-green-500 to-green-600"
      />

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Code Article"
          value={formData.code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
          placeholder="ART001"
          required
          error={errors.code}
        />

        <div className="col-span-2">
          <Input
            label="Nom"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nom de l'article"
            required
            error={errors.name}
          />
        </div>

        <div className="col-span-3">
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description détaillée de l'article"
          />
        </div>

        <Input
          label="Prix d'achat"
          type="number"
          step="0.01"
          value={formData.purchasePrice}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchasePrice: e.target.value })}
          placeholder="0.00"
          required
          error={errors.purchasePrice}
        />

        <Input
          label="Prix de vente"
          type="number"
          step="0.01"
          value={formData.sellingPrice}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sellingPrice: e.target.value })}
          placeholder="0.00"
          required
          error={errors.sellingPrice}
        />

        <Input
          label="Unité"
          value={formData.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unit: e.target.value })}
          placeholder="Pièce, Kg, L..."
        />

        <Input
          label="Stock Minimum"
          type="number"
          value={formData.stockMin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stockMin: e.target.value })}
        />

        <Input
          label="Stock Maximum"
          type="number"
          value={formData.stockMax}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stockMax: e.target.value })}
        />

        <Input
          label="Stock Actuel"
          type="number"
          value={formData.currentStock}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, currentStock: e.target.value })}
        />

        <Input
          label="Code-barres"
          value={formData.barcode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, barcode: e.target.value })}
          placeholder="EAN13..."
        />

        <div className="col-span-2">
          <CustomSelect
            label="Famille/Catégorie"
            value={formData.categoryId}
            onChange={(value: string) => setFormData({ ...formData, categoryId: value })}
            options={categoryOptions}
            placeholder="Sélectionner une famille"
            icon={FolderTree}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={handleCancel}>
          Annuler
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Créer Article
        </Button>
      </div>
    </Card>
  );
};

export default ArticleForm;