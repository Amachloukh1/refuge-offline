import { useEffect, useRef } from "react";
import {
  Home,
  MessageCircle,
  BookOpen,
  Cross,
  Package,
  Map,
  RadioTower,
  Video,
  ClipboardCheck,
  Settings,
  Search,
  ArrowRight,
  ChevronRight,
  X,
  Globe,
  Menu,
  Eye,
  Droplets,
  Utensils,
  Users,
  ShoppingCart,
  Flame,
  UserRound,
  Plus,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  Check,
  Download,
  MapPin,
  CloudOff,
  Radio,
  ShieldCheck,
  HeartPulse,
  Zap,
  CircleHelp,
  Send,
  Leaf,
  Compass,
  Battery,
  Waves,
  Sun,
  Snowflake,
  Activity,
  Wind,
  Trees,
  FlaskConical,
  Radiation,
  Printer,
  Flashlight,
  BatteryCharging,
  Bell,
  Backpack,
  FileText,
  CloudSun,
  RefreshCw,
  Thermometer,
} from "lucide-react";
const icons = {
  Flashlight,
  BatteryCharging,
  Bell,
  Backpack,
  FileText,
  CloudSun,
  RefreshCw,
  Thermometer,
  Home,
  MessageCircle,
  BookOpen,
  Cross,
  Package,
  Map,
  RadioTower,
  Video,
  ClipboardCheck,
  Settings,
  Search,
  ArrowRight,
  ChevronRight,
  X,
  Globe,
  Menu,
  Eye,
  Droplets,
  Utensils,
  Users,
  ShoppingCart,
  Flame,
  UserRound,
  Plus,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  Check,
  Download,
  MapPin,
  CloudOff,
  Radio,
  ShieldCheck,
  HeartPulse,
  Zap,
  CircleHelp,
  Send,
  Leaf,
  Compass,
  Battery,
  Waves,
  Sun,
  Snowflake,
  Activity,
  Wind,
  Trees,
  FlaskConical,
  Radiation,
  Printer,
};
export function Icon({ name, size = 22, ...props }) {
  const Component = icons[name] || CircleHelp;
  return (
    <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      <svg viewBox="0 0 80 74" aria-hidden="true">
        <path d="M10 65V29L40 5l30 24v36H47M10 65h21V46" />
        <path d="M31 52c-1-14 8-22 20-23-1 13-8 23-20 23Z" className="leaf" />
      </svg>
      <span>REFUGE</span>
    </div>
  );
}
export function CompassArt() {
  return (
    <svg className="compass-art" viewBox="0 0 300 250" aria-hidden="true">
      <path d="m4 190 45-36 30 27m141-50 30-25 40 37M65 224c55-20 115-2 163 17m-6-25c30-22 51-18 71-13M245 198v-55m-9 28 9-28 10 28m-19 8 9-23 10 23m16 18v-68m-9 30 9-30 11 30m-21 12 10-25 10 25" />
      <circle cx="149" cy="135" r="78" />
      <circle cx="149" cy="135" r="69" />
      <path d="M136 58v-9a13 13 0 0 1 26 0v9m-20-2v-7a7 7 0 0 1 14 0v7M149 72v8m0 110v8m-63-63h8m110 0h8m-97 46 24-54 44-38-24 54Z" />
      <path d="m139 127 20 16-44 38Z" fill="currentColor" opacity=".13" />
    </svg>
  );
}
export function Button({ children, icon, variant = "", ...props }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {icon && <Icon name={icon} size={19} />}
      <span>{children}</span>
    </button>
  );
}
export function External({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="external">
      {children}
      <Icon name="ExternalLink" size={15} />
    </a>
  );
}
export function Progress({ value }) {
  return (
    <div className="progress-line">
      <div className="track">
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span>{Math.round(value)} %</span>
    </div>
  );
}
export function PageHeading({ title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function Notice({ children, tone = "", icon = "CircleHelp" }) {
  return (
    <div className={`notice ${tone}`}>
      <Icon name={icon} size={21} />
      <div>{children}</div>
    </div>
  );
}
export function Modal({ title, children, onClose, t }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const cancel = (e) => {
      e.preventDefault();
      closeRef.current();
    };
    dialog.addEventListener("cancel", cancel);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label={t.close}>
          <Icon name="X" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
