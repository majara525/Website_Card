import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return <div className="page-container"><EmptyState icon={Compass} title="يبدو أن هذه الصفحة غادرت الحملة" description="الرابط الذي فتحته غير موجود، لكن كل المحتوى ما زال بانتظارك في الرئيسية." actionLabel="العودة إلى الرئيسية" onAction={() => navigate('/home')} /></div>;
}
