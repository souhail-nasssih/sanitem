import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface CreateEmployeeProps {
    onSuccess?: () => void;
}

export default function CreateEmployee({ onSuccess }: CreateEmployeeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nom_complet: '',
        cin: '',
        type: '',
        adresse: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/employees', {
            onSuccess: () => {
                showToast('Employee créé avec succès', 'success');
                reset();
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast('Erreur lors de la création de l\'employee', 'error');
            },
        });
    };

    return (
        <div className="mb-6">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    Ajouter un Employee
                </Button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Nouveau Employee
                        </h3>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nom_complet">Nom Complet *</Label>
                            <Input
                                id="nom_complet"
                                type="text"
                                required
                                placeholder="Nom complet de l'employee"
                                className="w-full"
                                value={data.nom_complet}
                                onChange={(e) => setData('nom_complet', e.target.value)}
                            />
                            <InputError message={errors.nom_complet} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cin">CIN *</Label>
                                <Input
                                    id="cin"
                                    type="text"
                                    required
                                    placeholder="CIN123456"
                                    className="w-full"
                                    value={data.cin}
                                    onChange={(e) => setData('cin', e.target.value)}
                                />
                                <InputError message={errors.cin} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Type *</Label>
                                <Input
                                    id="type"
                                    type="text"
                                    required
                                    placeholder="Type d'employee"
                                    className="w-full"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                />
                                <InputError message={errors.type} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="adresse">Adresse *</Label>
                            <Input
                                id="adresse"
                                type="text"
                                required
                                placeholder="Adresse complète"
                                className="w-full"
                                value={data.adresse}
                                onChange={(e) => setData('adresse', e.target.value)}
                            />
                            <InputError message={errors.adresse} />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {processing && <Spinner />}
                                Créer l'Employee
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsOpen(false);
                                    reset();
                                }}
                                disabled={processing}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

