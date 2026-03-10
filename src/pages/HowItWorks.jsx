import { LandingLayout } from '../components/layout/LandingLayout';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CheckCircle2, User, Building2, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
    const { t } = useLanguage();

    return (
        <LandingLayout>
            <section className="px-6 py-20 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <Badge variant="orange" className="mb-4">{t('howItWorks.badge')}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                        {t('howItWorks.title').split(' ').map((word, i) =>
                            word.toLowerCase() === 'action' || word.toLowerCase() === 'harakat' || word.toLowerCase() === 'делами'
                                ? <span key={i} className="text-brand-orange"> {word}</span>
                                : ' ' + word
                        )}
                    </h1>
                </div>

                {/* Section 1 — For Job Seekers */}
                <div className="mb-24">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <User className="text-brand-orange" />
                        {t('howItWorks.jobSeekers.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">01</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.jobSeekers.step1Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.jobSeekers.step1Desc')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">02</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.jobSeekers.step2Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.jobSeekers.step2Desc')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">03</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.jobSeekers.step3Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.jobSeekers.step3Desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2 — For Employers */}
                <div className="mb-24">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Building2 className="text-brand-orange" />
                        {t('howItWorks.employers.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">01</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.employers.step1Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.employers.step1Desc')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">02</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.employers.step2Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.employers.step2Desc')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl font-bold text-white/20">03</div>
                            <h3 className="text-xl font-bold">{t('howItWorks.employers.step3Title')}</h3>
                            <p className="text-brand-muted">
                                {t('howItWorks.employers.step3Desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3 — Why This Is Better */}
                <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <TrendingUp className="text-brand-orange" />
                        {t('howItWorks.whyBetter.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div>
                            <CheckCircle2 className="text-brand-orange mb-4" size={24} />
                            <h3 className="font-bold mb-2">{t('howItWorks.whyBetter.reason1Title')}</h3>
                            <p className="text-sm text-brand-muted">
                                {t('howItWorks.whyBetter.reason1Desc')}
                            </p>
                        </div>
                        <div>
                            <CheckCircle2 className="text-brand-orange mb-4" size={24} />
                            <h3 className="font-bold mb-2">{t('howItWorks.whyBetter.reason2Title')}</h3>
                            <p className="text-sm text-brand-muted">
                                {t('howItWorks.whyBetter.reason2Desc')}
                            </p>
                        </div>
                        <div>
                            <CheckCircle2 className="text-brand-orange mb-4" size={24} />
                            <h3 className="font-bold mb-2">{t('howItWorks.whyBetter.reason3Title')}</h3>
                            <p className="text-sm text-brand-muted">
                                {t('howItWorks.whyBetter.reason3Desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
