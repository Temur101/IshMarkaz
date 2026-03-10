import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LandingLayout } from '../components/layout/LandingLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useEffect } from 'react';

export default function LandingPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();



    const handleFindJobClick = () => {
        navigate('/jobs/all');
    };

    return (
        <LandingLayout>
            {/* Hero Section */}
            <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none" />

                <Badge variant="orange" className="mb-8 p-1.5 px-4 text-sm uppercase tracking-widest font-semibold border border-brand-orange/20">
                    {t('hero.badge')}
                </Badge>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-8 leading-[1.1]">
                    {t('hero.titlePart1')}<span className="text-brand-orange">{t('hero.titlePart2')}</span>{t('hero.titlePart3')}<br />
                    {t('hero.subtitlePart1')}<span className="text-brand-muted">{t('hero.subtitlePart2')}</span>.
                </h1>

                <p className="text-xl text-brand-muted max-w-2xl mb-12">
                    {t('hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button size="lg" className="rounded-full px-12 group" onClick={handleFindJobClick}>
                        {t('hero.startWorking')}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Link to="/how-it-works">
                        <Button size="lg" variant="secondary" className="rounded-full px-12">
                            {t('hero.howItWorks')}
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 flex justify-center scale-110">
                    <LanguageSwitcher />
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="px-6 py-24 w-full max-w-7xl mx-auto border-t border-white/5">
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="p-8">
                        <div className="bg-brand-orange/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="text-brand-orange" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{t('features.verifiedTitle')}</h3>
                        <p className="text-brand-muted text-lg">
                            {t('features.verifiedDesc')}
                        </p>
                    </Card>
                    <Card className="p-8">
                        <div className="bg-brand-orange/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="text-brand-orange" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{t('features.trialTitle')}</h3>
                        <p className="text-brand-muted text-lg">
                            {t('features.trialDesc')}
                        </p>
                    </Card>
                    <Card className="p-8">
                        <div className="bg-brand-orange/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <CheckCircle2 className="text-brand-orange" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{t('features.paymentTitle')}</h3>
                        <p className="text-brand-muted text-lg">
                            {t('features.paymentDesc')}
                        </p>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-24 text-center">
                <h2 className="text-4xl font-bold mb-8">{t('features.readyTitle')}</h2>
                <Button size="lg" className="rounded-full px-16" onClick={handleFindJobClick}>
                    {t('features.findTasks')}
                </Button>
            </section>
        </LandingLayout>
    );
}
