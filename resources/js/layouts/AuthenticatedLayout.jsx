import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    LayoutDashboard,
    Users,
    FileText,
    ChevronLeft,
    ChevronRight,
    Menu,
    ChevronDown,
    Package,
    Truck,
    ReceiptText,
    ClipboardList,
    Settings,
    ClipboardCheck,
    CalendarClock,
    Trash2,
    CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/Components/ThemeToggle";
import NotificationCenter from "@/Components/NotificationCenter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ToastContainer from "@/Components/Toast";

export default function AuthenticatedLayout({ header, children, hideSidebar = false, hideNotification = false }) {
    const { url } = usePage();
    const pageProps = usePage().props;
    const locale = pageProps.locale || 'fr';
    const user = pageProps.auth.user;
    const currentLocale = locale || 'fr';

    // Auto-hide sidebar and notification on select-employee page
    const isSelectEmployeePage = url.includes('/vendeur/select-employee');
    const shouldHideSidebar = hideSidebar || isSelectEmployeePage;
    const shouldHideNotification = hideNotification || isSelectEmployeePage;

    // Set RTL for Arabic
    useEffect(() => {
        if (currentLocale === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'fr');
        }
    }, [currentLocale]);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Initialize from localStorage, default to true if not set
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobile, setIsMobile] = useState(false);
    const notificationCenterRef = useRef(null);
    const lastCheckTimeRef = useRef(0);

    // Handle navigation and trigger due date check with debounce
    const handleNavigation = () => {
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckTimeRef.current;

        // Only check if it's been more than 30 seconds since last check
        if (timeSinceLastCheck > 30000) {
            lastCheckTimeRef.current = now;

            // Small delay to ensure the page has loaded
            setTimeout(() => {
                if (notificationCenterRef.current) {
                    notificationCenterRef.current.checkDueDates();
                }
            }, 500);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                // On desktop, restore the saved state or default to true
                const saved = localStorage.getItem('sidebarOpen');
                const shouldOpen = saved !== null ? JSON.parse(saved) : true;
                setSidebarOpen(shouldOpen);
            } else {
                // On mobile, always close sidebar
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Listen for URL changes and trigger due date check
    useEffect(() => {
        handleNavigation();
    }, [url]);

    // Check if user is Responsable - handle both array and object formats
    const isResponsable = useMemo(() => {
        if (!user?.roles) return false;
        return user.roles.some(role => {
            const roleName = typeof role === 'string' ? role : role?.name;
            return roleName === 'Responsable';
        });
    }, [user?.roles]);

    const { t } = useTranslation();

    const navigation = useMemo(() => [
        { name: t('dashboard'), href: "/dashboard", icon: LayoutDashboard },
        { name: t('produits'), href: "/produits", icon: Package },
        { name: t('employees'), href: "/employees", icon: CalendarClock },
        { name: t('fournisseurs'), href: "/fournisseurs", icon: Truck },
        { name: t('clients'), href: "/clients", icon: Users },
        // { name: "Factures Fournisseurs", href: "/facture-fournisseurs", icon: FileText },
        // { name: "Factures Clients", href: "/facture-clients", icon: ReceiptText },
        { name: t('bl_fournisseurs'), href: "/bl-fournisseurs", icon: ClipboardList },
        { name: t('bl_clients'), href: "/bl-clients", icon: ClipboardCheck },
        { name: t('trash'), href: "/trash", icon: Trash2 },
        // { name: "Règlement", href: "/reglements", icon: ReceiptText },
        ...(isResponsable ? [{ name: t('confirmations'), href: "/responsable/confirmations", icon: CheckCircle2 }] : []),
        { name: t('settings'), href: "/settings/profile", icon: Settings },
    ], [isResponsable, t]);

    const isActive = (href) => {
        const currentUrl = url.split("?")[0].replace(/\/+$/, "");
        const hrefPath = href.startsWith("http")
            ? new URL(href).pathname.replace(/\/+$/, "")
            : href.replace(/\/+$/, "");

        // Skip active state for hash links
        if (hrefPath === "#") {
            return false;
        }

        // Consider both "/" and "/dashboard" as dashboard
        if (hrefPath === "/dashboard") {
            return currentUrl === "/dashboard" || currentUrl === "/" ||
                   currentUrl === "/responsable/dashboard" ||
                   currentUrl === "/employee/dashboard" ||
                   currentUrl === "/vendeur/dashboard";
        }

        // Handle settings routes - match any settings route
        if (hrefPath === "/settings/profile") {
            return currentUrl.startsWith("/settings");
        }

        return (
            currentUrl === hrefPath ||
            (currentUrl.startsWith(hrefPath) && hrefPath !== "/")
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {!shouldHideSidebar && isMobile && (
                <div
                    className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => {
                        setSidebarOpen(false);
                        localStorage.setItem('sidebarOpen', JSON.stringify(false));
                    }}
                />
            )}

            {/* Sidebar */}
            {!shouldHideSidebar && (
                <div
                    className={`fixed inset-y-0 z-30 flex flex-col bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out ${
                        currentLocale === 'ar'
                            ? `right-0 border-l border-gray-200 dark:border-gray-700 ${sidebarOpen ? "w-64" : "w-20"}`
                            : `left-0 border-r border-gray-200 dark:border-gray-700 ${sidebarOpen ? "w-64" : "w-20"}`
                    }`}
                >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link
                        href="/"
                        className={`flex items-center overflow-hidden transition-all duration-300 ${
                            currentLocale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'
                        }`}
                    >
                        <ApplicationLogo className="block h-8 w-auto shrink-0 fill-current text-indigo-600 dark:text-indigo-400" />
                        <span
                            className={`text-xl font-bold whitespace-nowrap ${
                                sidebarOpen ? "opacity-100" : "opacity-0"
                            } text-gray-900 dark:text-white`}
                        >
                            Gestion Facture
                        </span>
                    </Link>
                </div>

                <nav className="mt-6 flex-1">
                    <div className="space-y-1 px-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={handleNavigation}
                                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
                                        active
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm"
                                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                            active
                                                ? "text-indigo-600 dark:text-indigo-300"
                                                : "text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400"
                                        }`}
                                    />
                                    <span
                                        className={`whitespace-nowrap transition-all duration-300 ${
                                            currentLocale === 'ar' ? 'mr-3' : 'ml-3'
                                        } ${
                                            sidebarOpen ? "opacity-100" : "opacity-0"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                    {user.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    currentLocale === 'ar' ? 'mr-3' : 'ml-3'
                                } ${
                                    sidebarOpen ? "opacity-100" : "opacity-0"
                                }`}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Main content area - Corrections principales ici */}
            <div className={`flex-1 flex flex-col min-w-0 ${
                shouldHideSidebar
                    ? "ml-0 mr-0"
                    : currentLocale === 'ar'
                        ? (sidebarOpen ? "lg:mr-64" : "lg:mr-20")
                        : (sidebarOpen ? "lg:ml-64" : "lg:ml-20")
            }`}>
                {/* Top navigation */}
                <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-full">
                    <div className="px-4 sm:px-6 lg:px-8 w-full">
                        <div className="flex h-16 items-center justify-between w-full">
                            {!shouldHideSidebar && (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => {
                                            const newState = !sidebarOpen;
                                            setSidebarOpen(newState);
                                            localStorage.setItem('sidebarOpen', JSON.stringify(newState));
                                        }}
                                        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
                                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                                    >
                                        {sidebarOpen ? (
                                            currentLocale === 'ar' ? (
                                                <ChevronRight className="h-6 w-6" />
                                            ) : (
                                                <ChevronLeft className="h-6 w-6" />
                                            )
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className={`flex items-center gap-2 ${
                                currentLocale === 'ar' ? 'mr-auto' : 'ml-auto'
                            }`}>
                                {!shouldHideNotification && <NotificationCenter ref={notificationCenterRef} />}
                                <LanguageSwitcher />
                                <ThemeToggle className={currentLocale === 'ar' ? "ml-4" : "mr-4"} />
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800"
                                                aria-label="User menu"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                                                        {user.name.split(" ").map((n) => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <span className={`hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                                                    currentLocale === 'ar' ? 'mr-3' : 'ml-3'
                                                }`}>
                                                    {user.name}
                                                </span>
                                                <ChevronDown className={`hidden h-5 w-5 text-gray-500 md:block dark:text-gray-400 ${
                                                    currentLocale === 'ar' ? 'mr-1' : 'ml-1'
                                                }`} />
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content className={`absolute mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 ${
                                            currentLocale === 'ar'
                                                ? 'left-0 origin-top-left'
                                                : 'right-0 origin-top-right'
                                        }`}>
                                            <Dropdown.Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                {t('profile')}
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                {t('logout')}
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto w-full">
                    {header && (
                        <header className="bg-white shadow-sm dark:bg-gray-800 w-full">
                            <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
                                {typeof header === 'string' ? (
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{header}</h1>
                                ) : (
                                    header
                                )}
                            </div>
                        </header>
                    )}

                    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
                        {children}
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
