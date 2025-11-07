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

interface Client {
    id: number;
    nom_complet: string;
}

interface Vendeur {
    id: number;
    numero_post: string;
    user?: {
        id: number;
        name: string;
    };
}

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    prix_vente: number;
}

interface CreateBonLivraisonProps {
    clients: Client[];
    vendeurs: Vendeur[];
    produits: Produit[];
    onSuccess?: () => void;
}

interface ProductDetail {
    produit_id: string;
    qte: string;
    prix: string;
}

export default function CreateBonLivraison({ clients, vendeurs, produits, onSuccess }: CreateBonLivraisonProps) {
    const { t, locale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        numero_bl: '',
        date_bl: getTodayDate(),
        client_id: '',
        vendeur_id: '',
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
            prix: produit.prix_vente.toString(),
        };

        setProductDetails([...productDetails, newDetail]);
        setSelectedProductId('');
        setQuantity('');
        setProductSearch('');
    };

    const removeProductDetail = (index: number) => {
        setProductDetails(productDetails.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const validDetails = productDetails
            .filter(detail => detail.produit_id && detail.qte && detail.prix)
            .map(detail => ({
                produit_id: parseInt(detail.produit_id),
                qte: parseFloat(detail.qte),
                prix: parseFloat(detail.prix),
            }));

        if (validDetails.length === 0) {
            showToast(t('add_at_least_one_product'), 'error');
            return;
        }

        setData('details', validDetails);
        
        post('/bl-clients', {
            onSuccess: () => {
                showToast(t('bl_client_created_success'), 'success');
                reset();
                setData('date_bl', getTodayDate());
                setProductDetails([]);
                setSelectedProductId('');
                setQuantity('');
                setProductSearch('');
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('bl_client_create_error'), 'error');
            },
        });
    };

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setData('date_bl', getTodayDate());
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
                    {t('add_bl_client')}
                </Button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {t('new_bl_client')}
                        </h3>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsOpen(false);
                                reset();
                                setData('date_bl', getTodayDate());
                                setProductDetails([]);
                                setSelectedProductId('');
                                setQuantity('');
                                setProductSearch('');
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="numero_bl">{t('numero_bl')} *</Label>
                                <Input
                                    id="numero_bl"
                                    type="number"
                                    min="1"
                                    required
                                    placeholder="1"
                                    className="w-full"
                                    value={data.numero_bl}
                                    onChange={(e) => setData('numero_bl', e.target.value)}
                                />
                                <InputError message={errors.numero_bl} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date_bl">{t('date_bl')} *</Label>
                                <Input
                                    id="date_bl"
                                    type="date"
                                    required
                                    className="w-full"
                                    value={data.date_bl}
                                    onChange={(e) => setData('date_bl', e.target.value)}
                                />
                                <InputError message={errors.date_bl} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="client_id">{t('client')} *</Label>
                                <Select
                                    value={data.client_id}
                                    onValueChange={(value) => setData('client_id', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('select_client')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id.toString()}>
                                                {client.nom_complet}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.client_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="vendeur_id">{t('vendeur')} *</Label>
                                <Select
                                    value={data.vendeur_id}
                                    onValueChange={(value) => setData('vendeur_id', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('select_vendeur')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendeurs.map((vendeur) => (
                                            <SelectItem key={vendeur.id} value={vendeur.id.toString()}>
                                                {vendeur.user?.name || `Vendeur #${vendeur.numero_post}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.vendeur_id} />
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
                                                        {t('prix')}: {produit.prix_vente.toFixed(2)} MAD
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
                                                            {t('prix')}: {produit.prix_vente.toFixed(2)} MAD
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
                                                            {t('quantite')}: {detail.qte} | {t('prix')}: {detail.prix} MAD | {t('total')}: {(parseFloat(detail.qte) * parseFloat(detail.prix)).toFixed(2)} MAD
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
                                {t('create_bl_client')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsOpen(false);
                                    reset();
                                    setData('date_bl', getTodayDate());
                                    setProductDetails([]);
                                    setSelectedProductId('');
                                    setQuantity('');
                                    setProductSearch('');
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
