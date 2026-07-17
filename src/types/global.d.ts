declare module 'next/server.js' {
  export type NextRequest = import('next/server').NextRequest
  export type NextResponse = import('next/server').NextResponse
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = any
  export type ResolvingViewport = any
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string
  export function verify(token: string, secret: string): any
  export function decode(token: string): any
  export type JwtPayload = any
}

declare module 'lucide-react' {
  const Icon: any
  export default Icon
  export const AlertCircle: any
  export const AlertTriangle: any
  export const ArrowDown: any
  export const ArrowDownCircle: any
  export const ArrowLeft: any
  export const ArrowRight: any
  export const ArrowUpCircle: any
  export const Award: any
  export const Bot: any
  export const BarChart3: any
  export const Barcode: any
  export const Calendar: any
  export const Camera: any
  export const Check: any
  export const CheckCircle: any
  export const ChevronLeft: any
  export const ChevronRight: any
  export const Clock: any
  export const Copy: any
  export const CreditCard: any
  export const Crown: any
  export const DollarSign: any
  export const Edit: any
  export const ExternalLink: any
  export const Eye: any
  export const EyeOff: any
  export const Facebook: any
  export const FileText: any
  export const Filter: any
  export const Gift: any
  export const Globe: any
  export const Heart: any
  export const HelpCircle: any
  export const Home: any
  export const Image: any
  export const Info: any
  export const Instagram: any
  export const LayoutDashboard: any
  export const Loader: any
  export const Loader2: any
  export const Lock: any
  export const LogOut: any
  export const Mail: any
  export const MapPin: any
  export const Megaphone: any
  export const Menu: any
  export const MessageCircle: any
  export const MoreVertical: any
  export const Package: any
  export const Percent: any
  export const Phone: any
  export const Plus: any
  export const Quote: any
  export const RefreshCw: any
  export const Save: any
  export const Scissors: any
  export const Search: any
  export const Send: any
  export const Settings: any
  export const Share2: any
  export const Shield: any
  export const ShoppingBag: any
  export const Smartphone: any
  export const Sparkles: any
  export const Star: any
  export const Target: any
  export const Trash2: any
  export const TrendingDown: any
  export const TrendingUp: any
  export const Upload: any
  export const User: any
  export const UserCheck: any
  export const Users: any
  export const UsersRound: any
  export const UserX: any
  export const Wallet: any
  export const X: any
  export const XCircle: any
  export const Zap: any
}

declare module 'cloudinary' {
  export const v2: any
}

declare module 'bcryptjs' {
  export function hash(data: string, salt: number | string): Promise<string>
  export function compare(data: string, encrypted: string): Promise<boolean>
  export function genSalt(rounds?: number): Promise<string>
}

declare module 'react-hot-toast' {
  const toast: any
  export default toast
  export const Toaster: any
}
