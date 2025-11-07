import { useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, Search } from 'lucide-react';

interface Fournisseur {
    id: number;
    nom_complet: string;
}

interface Employee {
    id: number;
    nom_complet: string;
}

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    prix_achat: number;
}

interface DetailBLFournisseur {
    id: number;
    produit_id: number;
    qte: number;
    prix: number;
    discription: string;
}

interface BLFournisseur {
    id: number;
    numero_bl: number;
    date_bl_fournisseur: string;
    fournisseur_id: number;
    employee_id: number;
    detailBLFournisseurs?: DetailBLFournisseur[];
}

interface ProductDetail {
    produit_id: string;
    qte: string;
    prix: string;
    discription: string;
}

interface EditBLFournisseurProps {
    blFournisseur: BLFournisseur;
    fournisseurs: Fournisseur[];
    employees: Employee[];
    produits: Produit[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EditBLFournisseur({ blFournisseur, fournisseurs, employees, produits, onSuccess, onCancel }: EditBLFournisseurProps) {
    const { t, locale } = useTranslation();
    const [productDetails, setProductDetails] = useState<ProductDetail[]>(() => {
        if (blFournisseur.detailBLFournisseurs && blFournisseur.detailBLFournisseurs.length > 0) {
            return blFournisseur.detailBLFournisseurs.map(detail => ({
                produit_id: detail.produit_id.toString(),
                qte: detail.qte.toString(),
                prix: detail.prix.toString(),
                discription: detail.discription,
            }));
        }
        return [];
    });
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        numero_bl: blFournisseur.numero_bl?.toString() || '',
        date_bl_fournisseur: blFournisseur.date_bl_fournisseur || '',
        fournisseur_id: blFournisseur.fournisseur_id?.toString() || '',
        employee_id: blFournisseur.employee_id?.toString() || '',
        details: [] as ProductDetail[],
    });

    // Filter products based on search
    const filteredProducts = produits.filter(
        produit => 
            !productDetails.some(detail => detail.produit_id === produit.id.toString()) &&
            (produit.reférence.toLowerCase().includes(productSearch.toLowerCase()) ||
             produit.discription.toLowerCase().includes(productSearch.toLowerCase()))
    );

    // Handle product selection
    const handleProductSelect = (produit: Produit) => {
        setSelectedProductId(produit.id.toString());
        setQuantity('');
        setProductSearch(`${produit.reférence} - ${produit.discription}`);
        setShowProductDropdown(false);
    };

    // Handle adding product to list
    const handleAddProduct = () => {
        if (!selectedProductId || !quantity) {
            showToast(t('fill_all_fields'), 'error');
            return;
        }

        const produit = produits.find(p => p.id.toString() === selectedProductId);
        if (!produit) {
            showToast(t('product_not_found'), 'error');
            return;
        }

        const newDetail: ProductDetail = {
            produit_id: selectedProductId,
            qte: quantity,
            prix: produit.prix_achat.toString(),
            discription: produit.discription,
        };

        setProductDetails([...productDetails, newDetail]);
        setSelectedProductId('');
        setQuantity('');
        setProductSearch('');
    };

    const removeProductDetail = (index: number) => {
        setProductDetails(productDetails.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (blFournisseur.detailBLFournisseurs && blFournisseur.detailBLFournisseurs.length > 0) {
            setProductDetails(blFournisseur.detailBLFournisseurs.map(detail => ({
                produit_id: detail.produit_id.toString(),
                qte: detail.qte.toString(),
                prix: detail.prix.toString(),
                discription: detail.discription,
            })));
        } else {
            setProductDetails([]);
        }
        reset({
            numero_bl: blFournisseur.numero_bl?.toString() || '',
            date_bl_fournisseur: blFournisseur.date_bl_fournisseur || '',
            fournisseur_id: blFournisseur.fournisseur_id?.toString() || '',
            employee_id: blFournisseur.employee_id?.toString() || '',
        });
    }, [blFournisseur, reset]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProductDropdown(false);
            }
        };

        if (showProductDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProductDropdown]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const validDetails = productDetails
            .filter(detail => detail.produit_id && detail.qte && detail.prix && detail.discription)
            .map(detail => ({
                produit_id: parseInt(detail.produit_id),
                qte: parseFloat(detail.qte),
                prix: parseFloat(detail.prix),
                discription: detail.discription,
            }));

        if (validDetails.length === 0) {
            showToast(t('add_at_least_one_product'), 'error');
            return;
        }

        setData('details', validDetails);
        
        put(`/bl-fournisseurs/${blFournisseur.id}`, {
            onSuccess: () => {
                showToast(t('bl_supplier_updated_success'), 'success');
                reset();
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('bl_supplier_update_error'), 'error');
            },
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {t('edit_bl_supplier')}
                </h3>
                {onCancel && (
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="numero_bl">{t('numero_bl')} *</Label>
                        <Input
                            id="numero_bl"
                            type="number"
                            required
                            min="1"
                            placeholder="1"
                            className="w-full"
                            value={data.numero_bl}
                            onChange={(e) => setData('numero_bl', e.target.value)}
                        />
                        <InputError message={errors.numero_bl} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date_bl_fournisseur">{t('date_bl')} *</Label>
                        <Input
                            id="date_bl_fournisseur"
                            type="date"
                            required
                            className="w-full"
                            value={data.date_bl_fournisseur}
                            onChange={(e) => setData('date_bl_fournisseur', e.target.value)}
                        />
                        <InputError message={errors.date_bl_fournisseur} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fournisseur_id">{t('fournisseur')} *</Label>
                        <Select
                            value={data.fournisseur_id}
                            onValueChange={(value) => setData('fournisseur_id', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('select') + ' ' + t('fournisseur')} />
                            </SelectTrigger>
                            <SelectContent>
                                {fournisseurs.map((fournisseur) => (
                                    <SelectItem key={fournisseur.id} value={fournisseur.id.toString()}>
                                        {fournisseur.nom_complet}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.fournisseur_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="employee_id">{t('employee')} *</Label>
                        <Select
                            value={data.employee_id}
                            onValueChange={(value) => setData('employee_id', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('select') + ' ' + t('employee')} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                        {employee.nom_complet}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.employee_id} />
                    </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{t('products')}</Label>
                    </div>

                    {/* Product Search and Selection */}
                    <div className="space-y-3">
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={t('search_products')}
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductDropdown(true);
                                        setSelectedProductId('');
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    className="pl-10"
                                />
                            </div>
                            
                            {/* Dropdown List */}
                            {showProductDropdown && filteredProducts.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredProducts.map((produit) => (
                                        <div
                                            key={produit.id}
                                            onClick={() => handleProductSelect(produit)}
                                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {produit.reférence}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {produit.discription}
                                            </div>
                                            <div className="text-sm text-indigo-600 dark:text-indigo-400">
                                                {t('prix')}: {produit.prix_achat.toFixed(2)} MAD
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Product Info and Quantity */}
                        {selectedProductId && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                {(() => {
                                    const produit = produits.find(p => p.id.toString() === selectedProductId);
                                    return produit ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {produit.reférence} - {produit.discription}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('prix')}: {produit.prix_achat.toFixed(2)} MAD
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>{t('quantite')} *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    required
                                                    placeholder="0.00"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddProduct}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                            >
                                                {t('add')}
                                            </Button>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Added Products List */}
                    {productDetails.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <Label className="text-base font-semibold">{t('added_products')}</Label>
                            {productDetails.map((detail, index) => {
                                const produit = produits.find(p => p.id.toString() === detail.produit_id);
                                return (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {produit?.reférence} - {produit?.discription}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('quantite')}: {detail.qte} | {t('prix')}: {detail.prix} MAD | {t('description')}: {detail.discription} | {t('total')}: {(parseFloat(detail.qte) * parseFloat(detail.prix)).toFixed(2)} MAD
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeProductDetail(index)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-3 sm:pt-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {processing && <Spinner />}
                        {t('update')}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            {t('cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
