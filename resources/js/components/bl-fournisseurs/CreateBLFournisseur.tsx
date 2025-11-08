import { useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, Search, Plus, X } from 'lucide-react';

interface Fournisseur {
    id: number;
    nom_complet: string;
    numero_tel?: string;
    adresse?: string;
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
    qte_stock: number;
}

interface CreateBLFournisseurProps {
    fournisseurs: Fournisseur[];
    employees?: Employee[];
    produits: Produit[];
    nextNumeroBL?: string;
    currentEmployeeId?: number | null;
    onSuccess?: () => void;
}

interface ProductDetail {
    produit_id: string;
    qte: string;
    prix: string;
    discription: string;
}

export default function CreateBLFournisseur({ fournisseurs, produits, nextNumeroBL, currentEmployeeId, onSuccess }: CreateBLFournisseurProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const [showCreateFournisseur, setShowCreateFournisseur] = useState(false);
    const [newFournisseurs, setNewFournisseurs] = useState<Fournisseur[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { data, setData, processing, errors, reset } = useForm({
        date_bl_fournisseur: getTodayDate(),
        fournisseur_id: '',
        employee_id: currentEmployeeId?.toString() || '',
        details: [] as ProductDetail[],
    });

    // Fournisseur creation form
    const { data: fournisseurData, setData: setFournisseurData, errors: fournisseurErrors, reset: resetFournisseur } = useForm({
        nom_complet: '',
        numero_tel: '',
        adresse: '',
    });

    // Set employee_id when currentEmployeeId changes or when form opens
    useEffect(() => {
        if (currentEmployeeId && (isOpen || !data.employee_id)) {
            setData('employee_id', currentEmployeeId.toString());
        }
    }, [currentEmployeeId, isOpen, data.employee_id, setData]);

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

    // Combine existing fournisseurs with newly created ones
    const allFournisseurs = [...fournisseurs, ...newFournisseurs];

    const createBLFournisseur = (fournisseurId: string) => {
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

        // Prepare all form data including details
        const formData = {
            date_bl_fournisseur: data.date_bl_fournisseur,
            fournisseur_id: fournisseurId,
            employee_id: data.employee_id,
            details: validDetails,
        };

        // Use router.post directly with complete data to ensure all data is sent
        router.post('/bl-fournisseurs', formData, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(t('bl_supplier_created_success'), 'success');
                reset();
                resetFournisseur();
                setData('date_bl_fournisseur', getTodayDate());
                setData('employee_id', currentEmployeeId?.toString() || '');
                setProductDetails([]);
                setSelectedProductId('');
                setQuantity('');
                setProductSearch('');
                setShowCreateFournisseur(false);
                setNewFournisseurs([]);
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                console.error('BL Fournisseur creation errors:', errors);
                console.error('Form data sent:', formData);
                showToast(t('bl_supplier_create_error'), 'error');
            },
        });
    };

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

        // Check if user is creating a new fournisseur
        if (showCreateFournisseur && fournisseurData.nom_complet && fournisseurData.numero_tel && fournisseurData.adresse) {
            // First create the fournisseur, then create the BL fournisseur
            router.post('/fournisseurs', fournisseurData, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Get the created fournisseur from flash data
                    const pageProps = page.props as { flash?: { created_fournisseur?: Fournisseur }; fournisseurs?: Fournisseur[] };
                    let created: Fournisseur | null = null;

                    if (pageProps.flash?.created_fournisseur) {
                        created = pageProps.flash.created_fournisseur;
                    } else {
                        // Fallback: reload fournisseurs list to get the newly created fournisseur
                        router.reload({
                            only: ['fournisseurs'],
                            onSuccess: (reloadedPage) => {
                                const reloadedProps = reloadedPage.props as { fournisseurs?: Fournisseur[] };
                                const reloadedFournisseurs = reloadedProps.fournisseurs || [];
                                const found = reloadedFournisseurs.find((f: Fournisseur) => f.nom_complet === fournisseurData.nom_complet);
                                if (found) {
                                    createBLFournisseur(found.id.toString());
                                } else {
                                    showToast(t('fournisseur_create_error') || 'Error creating fournisseur', 'error');
                                }
                            },
                        });
                        return;
                    }

                    if (created) {
                        // Now create the BL fournisseur with the newly created fournisseur
                        createBLFournisseur(created.id.toString());
                    } else {
                        showToast(t('fournisseur_create_error') || 'Error creating fournisseur', 'error');
                    }
                },
                onError: () => {
                    showToast(t('fournisseur_create_error') || 'Error creating fournisseur', 'error');
                },
            });
        } else {
            // Fournisseur is already selected, proceed with BL fournisseur creation
            if (!data.fournisseur_id) {
                showToast(t('select_fournisseur') || 'Please select a fournisseur', 'error');
                return;
            }
            createBLFournisseur(data.fournisseur_id);
        }
    };

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setData('date_bl_fournisseur', getTodayDate());
        }
    }, [isOpen]);

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

    return (
        <div className="mb-6">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {t('add_bl_supplier')}
                </Button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {t('new_bl_supplier')}
                        </h3>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsOpen(false);
                                reset();
                                resetFournisseur();
                                setData('date_bl_fournisseur', getTodayDate());
                                setData('employee_id', currentEmployeeId?.toString() || '');
                                setProductDetails([]);
                                setSelectedProductId('');
                                setQuantity('');
                                setProductSearch('');
                                setShowCreateFournisseur(false);
                                setNewFournisseurs([]);
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="numero_bl">{t('numero_bl')}</Label>
                                <Input
                                    id="numero_bl"
                                    type="text"
                                    readOnly
                                    disabled
                                    className="w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                    value={nextNumeroBL || 'BL00001'}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('auto_generated') || 'Numéro généré automatiquement'}
                                </p>
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="fournisseur_id">{t('fournisseur')} *</Label>
                                    {!showCreateFournisseur && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCreateFournisseur(true)}
                                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 h-8 px-2 text-xs"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {t('add_fournisseur') || 'Add Fournisseur'}
                                        </Button>
                                    )}
                                </div>
                                {!showCreateFournisseur ? (
                                    <Select
                                        value={data.fournisseur_id}
                                        onValueChange={(value) => setData('fournisseur_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select') + ' ' + t('fournisseur')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allFournisseurs.map((fournisseur) => (
                                                <SelectItem key={fournisseur.id} value={fournisseur.id.toString()}>
                                                    {fournisseur.nom_complet}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('new_fournisseur') || 'New Fournisseur'}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setShowCreateFournisseur(false);
                                                    resetFournisseur();
                                                }}
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nom_complet">{t('nom_complet')} *</Label>
                                                <Input
                                                    id="nom_complet"
                                                    type="text"
                                                    required
                                                    placeholder={t('supplier_full_name_placeholder') || 'Full name'}
                                                    className="w-full"
                                                    value={fournisseurData.nom_complet}
                                                    onChange={(e) => setFournisseurData('nom_complet', e.target.value)}
                                                />
                                                <InputError message={fournisseurErrors.nom_complet} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="numero_tel">{t('numero_tel')} *</Label>
                                                <Input
                                                    id="numero_tel"
                                                    type="text"
                                                    required
                                                    placeholder="+212 6XX XXX XXX"
                                                    className="w-full"
                                                    value={fournisseurData.numero_tel}
                                                    onChange={(e) => setFournisseurData('numero_tel', e.target.value)}
                                                />
                                                <InputError message={fournisseurErrors.numero_tel} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="adresse">{t('adresse')} *</Label>
                                                <Input
                                                    id="adresse"
                                                    type="text"
                                                    required
                                                    placeholder={t('complete_address_placeholder') || 'Complete address'}
                                                    className="w-full"
                                                    value={fournisseurData.adresse}
                                                    onChange={(e) => setFournisseurData('adresse', e.target.value)}
                                                />
                                                <InputError message={fournisseurErrors.adresse} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {t('fournisseur_will_be_created_automatically') || 'Le fournisseur sera créé automatiquement lors de la création du BL Fournisseur'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <InputError message={errors.fournisseur_id} />
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
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="text-sm text-indigo-600 dark:text-indigo-400">
                                                            {t('prix')}: {produit.prix_achat.toFixed(2)} MAD
                                                        </div>
                                                        <div className={`text-sm font-medium ${produit.qte_stock <= 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                            {t('in_stock')}: {produit.qte_stock}
                                                        </div>
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
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {t('prix')}: {produit.prix_achat.toFixed(2)} MAD
                                                            </p>
                                                            <p className={`text-sm font-medium ${produit.qte_stock <= 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                {t('in_stock')}: {produit.qte_stock}
                                                            </p>
                                                        </div>
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
                                {t('create_bl_supplier')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsOpen(false);
                                    reset();
                                    resetFournisseur();
                                    setData('date_bl_fournisseur', getTodayDate());
                                    setData('employee_id', currentEmployeeId?.toString() || '');
                                    setProductDetails([]);
                                    setSelectedProductId('');
                                    setQuantity('');
                                    setProductSearch('');
                                    setShowCreateFournisseur(false);
                                    setNewFournisseurs([]);
                                }}
                                disabled={processing}
                            >
                                {t('cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
