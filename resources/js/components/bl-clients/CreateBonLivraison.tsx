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
import { Trash2, Search, Plus, X, FileText, Calendar, Users, Package, Hash, DollarSign, Coins } from 'lucide-react';

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
    qte_stock: number;
}

interface CreateBonLivraisonProps {
    clients: Client[];
    vendeurs?: Vendeur[];
    produits: Produit[];
    nextNumeroBL?: string;
    currentVendeurId?: number | null;
    onSuccess?: () => void;
}

interface ProductDetail {
    produit_id: string;
    qte: string;
    prix: string;
}

export default function CreateBonLivraison({ clients, produits, nextNumeroBL, currentVendeurId, onSuccess }: CreateBonLivraisonProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [newClients, setNewClients] = useState<Client[]>([]);
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
        date_bl: getTodayDate(),
        client_id: '',
        vendeur_id: currentVendeurId?.toString() || '',
        details: [] as ProductDetail[],
    });

    // Client creation form
    const { data: clientData, setData: setClientData, errors: clientErrors, reset: resetClient } = useForm({
        nom_complet: '',
        numero_tel: '',
        adresse: '',
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


    // Combine existing clients with newly created ones
    const allClients = [...clients, ...newClients];

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

        // Check if user is creating a new client
        if (showCreateClient && clientData.nom_complet && clientData.numero_tel && clientData.adresse) {
            // First create the client, then create the BL client
            router.post('/clients', clientData, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Get the created client from flash data
                    const pageProps = page.props as { flash?: { created_client?: Client }; clients?: Client[] };
                    let created: Client | null = null;

                    if (pageProps.flash?.created_client) {
                        created = pageProps.flash.created_client;
                    } else {
                        // Fallback: reload clients list to get the newly created client
                        router.reload({
                            only: ['clients'],
                            onSuccess: (reloadedPage) => {
                                const reloadedProps = reloadedPage.props as { clients?: Client[] };
                                const reloadedClients = reloadedProps.clients || [];
                                const found = reloadedClients.find((c: Client) => c.nom_complet === clientData.nom_complet);
                                if (found) {
                                    createBLClient(found.id.toString());
                                } else {
                                    showToast(t('client_create_error'), 'error');
                                }
                            },
                        });
                        return;
                    }

                    if (created) {
                        // Now create the BL client with the newly created client
                        createBLClient(created.id.toString());
                    } else {
                        showToast(t('client_create_error'), 'error');
                    }
                },
                onError: () => {
                    showToast(t('client_create_error'), 'error');
                },
            });
        } else {
            // Client is already selected, proceed with BL client creation
            if (!data.client_id) {
                showToast(t('select_client') || 'Please select a client', 'error');
                return;
            }
            createBLClient(data.client_id);
        }
    };

    const createBLClient = (clientId: string) => {
        const validDetails = productDetails
            .filter(detail => detail.produit_id && detail.qte && detail.prix)
            .map(detail => ({
                produit_id: parseInt(detail.produit_id),
                qte: parseFloat(detail.qte),
                prix: parseFloat(detail.prix),
            }));

        // Always use currentVendeurId first, then fall back to data.vendeur_id
        const vendeurId = currentVendeurId?.toString() || (data.vendeur_id && data.vendeur_id.trim() !== '' ? data.vendeur_id : '');

        if (!vendeurId) {
            showToast(t('vendeur_required'), 'error');
            return;
        }

        // Prepare all form data including details
        const formData = {
            date_bl: data.date_bl,
            client_id: clientId,
            vendeur_id: vendeurId,
            details: validDetails,
        };

        // Use router.post directly with complete data to ensure all data is sent
        router.post('/bl-clients', formData, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(t('bl_client_created_success'), 'success');
                reset();
                resetClient();
                setData('date_bl', getTodayDate());
                setData('vendeur_id', currentVendeurId?.toString() || '');
                setProductDetails([]);
                setSelectedProductId('');
                setQuantity('');
                setProductSearch('');
                setShowCreateClient(false);
                setNewClients([]);
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                console.error('BL Client creation errors:', errors);
                console.error('Form data sent:', formData);
                showToast(t('bl_client_create_error'), 'error');
            },
        });
    };

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setData('date_bl', getTodayDate());
            if (currentVendeurId) {
                setData('vendeur_id', currentVendeurId.toString());
            } else {
                setData('vendeur_id', '');
            }
        }
    }, [isOpen, currentVendeurId, setData]);

    // Ensure vendeur_id is set when currentVendeurId changes
    useEffect(() => {
        if (currentVendeurId && !data.vendeur_id) {
            setData('vendeur_id', currentVendeurId.toString());
        }
    }, [currentVendeurId, data.vendeur_id, setData]);

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
                                resetClient();
                                setData('date_bl', getTodayDate());
                                setData('vendeur_id', currentVendeurId?.toString() || '');
                                setProductDetails([]);
                                setSelectedProductId('');
                                setQuantity('');
                                setProductSearch('');
                                setShowCreateClient(false);
                                setNewClients([]);
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="numero_bl" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>{t('numero_bl')}</span>
                                </Label>
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
                                <Label htmlFor="date_bl" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>{t('date_bl')} *</span>
                                </Label>
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="client_id" className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>{t('client')} *</span>
                                    </Label>
                                    {!showCreateClient && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCreateClient(true)}
                                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 h-8 px-2 text-xs"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {t('add_client')}
                                        </Button>
                                    )}
                                </div>
                                {!showCreateClient ? (
                                    <Select
                                        value={data.client_id}
                                        onValueChange={(value) => setData('client_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_client')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allClients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                    {client.nom_complet}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('new_client')}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setShowCreateClient(false);
                                                    resetClient();
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
                                                    placeholder={t('client_full_name_placeholder')}
                                                    className="w-full"
                                                    value={clientData.nom_complet}
                                                    onChange={(e) => setClientData('nom_complet', e.target.value)}
                                                />
                                                <InputError message={clientErrors.nom_complet} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="numero_tel">{t('numero_tel')} *</Label>
                                                <Input
                                                    id="numero_tel"
                                                    type="text"
                                                    required
                                                    placeholder="0612345678"
                                                    className="w-full"
                                                    value={clientData.numero_tel}
                                                    onChange={(e) => setClientData('numero_tel', e.target.value)}
                                                />
                                                <InputError message={clientErrors.numero_tel} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="adresse">{t('adresse')} *</Label>
                                                <Input
                                                    id="adresse"
                                                    type="text"
                                                    required
                                                    placeholder={t('complete_address_placeholder')}
                                                    className="w-full"
                                                    value={clientData.adresse}
                                                    onChange={(e) => setClientData('adresse', e.target.value)}
                                                />
                                                <InputError message={clientErrors.adresse} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {t('client_will_be_created_automatically') || 'Le client sera créé automatiquement lors de la création du BL Client'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <InputError message={errors.client_id} />
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>{t('products')}</span>
                                </Label>
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
                                                            {t('prix')}: {produit.prix_vente.toFixed(2)} MAD
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
                                                                {t('prix')}: {produit.prix_vente.toFixed(2)} MAD
                                                            </p>
                                                            <p className={`text-sm font-medium ${produit.qte_stock <= 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                {t('in_stock')}: {produit.qte_stock}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span>{t('quantite')} *</span>
                                                        </Label>
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
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <span>{t('added_products')}</span>
                                    </Label>
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
                                    resetClient();
                                    setData('date_bl', getTodayDate());
                                    setData('vendeur_id', currentVendeurId?.toString() || '');
                                    setProductDetails([]);
                                    setSelectedProductId('');
                                    setQuantity('');
                                    setProductSearch('');
                                    setShowCreateClient(false);
                                    setNewClients([]);
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
