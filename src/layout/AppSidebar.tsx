import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

// Assume these icons are imported from an icon library
import {
  ErrorHexaIcon,
  AlertHexaIcon,
  MoreDotIcon,
  DownloadIcon,
  FileIcon,
  GridIcon,
  AudioIcon,
  VideoIcon,
  BoltIcon,
  PlusIcon,
  BoxIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  ErrorIcon,
  ArrowUpIcon,
  FolderIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  GroupIcon,
  BoxIconLine,
  ShootingStarIcon,
  DollarLineIcon,
  TrashBinIcon,
  AngleUpIcon,
  AngleDownIcon,
  PencilIcon,
  CheckLineIcon,
  CloseLineIcon,
  ChevronDownIcon,
  PaperPlaneIcon,
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  CalenderIcon,
  EyeIcon,
  EyeCloseIcon,
  TimeIcon,
  CopyIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  TaskIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon,
  DocsIcon,
  MailIcon,
  HorizontaLDots,
  ChevronUpIcon,
  ChatIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { signOut } from "firebase/auth";
import { auth } from "../configuration";
import { Modal } from "../components/ui/modal";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <PieChartIcon />,
    name: "Aktivitas Parkir",
    subItems: [
      { name: "Hari Ini", path: "/activity-today", pro: false },
      { name: "Mingguan", path: "/activity", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Jadwal",
    path: "/schedule",
  },
  {
    icon: <TableIcon />,
    name: "Tabel Pengguna",
    subItems: [
      { name: "Tabel Mahasiswa", path: "/student-table", pro: false },
      { name: "Tabel Petugas", path: "/parking-attendant-table", pro: false },
      { name: "Tabel Tempat Parkir", path: "/parking-lot-table", pro: false },
    ],
  },
  // {
  //   icon: <TimeIcon />,
  //   name: "Aktivitas Parkir",
  //   path: "/histories",
  // },
  {
    icon: <PlusIcon />,
    name: "Tambah Data",
    subItems: [
      { name: "Daftar Mahasiswa Baru", path: "/create-student", pro: false },
      { name: "Daftar Petugas Baru", path: "/create-parking-attendant", pro: false },
      { name: "Daftar Tempat Parkir Baru", path: "/create-parking-lot", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Autentikasi",
    subItems: [{ name: "Keluar", path: "/logout", pro: false }],
  },
];

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      setShowLogoutModal(false);
      navigate("/signin");
    } catch (error) {
      alert("Gagal keluar. Harap coba lagi!");
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
              )}
            </button>
          ) : (
            nav.path && (
              <Link to={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {subItem.name.toLowerCase() !== "keluar" ? (
                      <Link to={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>new</span>}
                          {subItem.pro && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>pro</span>}
                        </span>
                      </Link>
                    ) : (
                      <button onClick={handleLogoutClick} className={`w-full menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>new</span>}
                          {subItem.pro && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>pro</span>}
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`justify-center items-center py-1 flex`}>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden my-4" src="/images/logo/parky-logo-b.png" alt="Logo" width={120} height={40} />
              <img className="hidden dark:block" src="/images/logo/parky-logo.png" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <>
              <img className="dark:hidden my-4" src="/images/logo/parky-logo-b.png" alt="Logo" width={20} height={20} />
              <img className="hidden dark:block" src="/images/logo/parky-logo.png" alt="Logo" width={20} height={20} />
            </>
          )}
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                  {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
              {/* <div className="">
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>{isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}</h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
            </div>
          </nav>

          {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
        </div>
      </aside>
      <Modal isOpen={showLogoutModal} onClose={handleLogoutCancel} className="max-w-md p-6 absolute">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Konfirmasi Logout</h3>
          <p className="mt-2 text-sm text-gray-600">Apakah Anda yakin ingin keluar?</p>
          <div className="mt-4 flex justify-center gap-4">
            <button onClick={handleLogoutCancel} className="px-4 py-2 bg-gray-300 text-black rounded-lg">
              Batal
            </button>
            <button onClick={handleLogoutConfirm} className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg" disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Keluar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AppSidebar;
