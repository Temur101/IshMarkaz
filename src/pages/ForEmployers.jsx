import { LandingLayout } from '../components/layout/LandingLayout';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ForEmployers() {
    const { t } = useLanguage();

    return (
        <LandingLayout>
            <section className="px-6 py-20 max-w-5xl mx-auto">
                <div className="text-center mb-20">
                    <Badge variant="orange" className="mb-4">{t('forEmployers.badge')}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                        {t('forEmployers.title').split(' ').map((word, i) =>
                            word.toLowerCase() === 'performance' || word.toLowerCase() === 'результата' || word.toLowerCase() === 'natija'
                                ? <span key={i} className="text-brand-orange"> {word}</span>
                                : ' ' + word
                        )}
                    </h1>
                    <p className="text-brand-muted text-xl max-w-2xl mx-auto">
                        {t('forEmployers.description')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-24">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Award className="text-brand-orange" />
                                {t('forEmployers.paidPostings.title')}
                            </h2>
                            <p className="text-brand-muted leading-relaxed">
                                {t('forEmployers.paidPostings.desc')}
                            </p>
                        </div>
                        <Card className="p-6 border-brand-orange/20 bg-brand-orange/5">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <ShieldAlert size={20} className="text-brand-orange" />
                                {t('forEmployers.unpaidTasks.title')}
                            </h3>
                            <p className="text-sm text-brand-muted">
                                {t('forEmployers.unpaidTasks.desc')}
                            </p>
                        </Card>
                    </div>

                    <div className="space-y-8 text-left">
                        <h2 className="text-2xl font-bold mb-4">{t('forEmployers.howTrialWorks.title')}</h2>
                        <ul className="space-y-4">
                            {[
                                t('forEmployers.howTrialWorks.step1'),
                                t('forEmployers.howTrialWorks.step2'),
                                t('forEmployers.howTrialWorks.step3'),
                                t('forEmployers.howTrialWorks.step4'),
                                t('forEmployers.howTrialWorks.step5')
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3">
                                    <CheckCircle2 className="text-brand-orange shrink-0 mt-1" size={18} />
                                    <span className="text-white/80">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mb-24">
                    <h2 className="text-3xl font-bold mb-12 text-center">{t('forEmployers.hiringProcess.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: t('forEmployers.hiringProcess.step1Title'), desc: t('forEmployers.hiringProcess.step1Desc') },
                            { step: "02", title: t('forEmployers.hiringProcess.step2Title'), desc: t('forEmployers.hiringProcess.step2Desc') },
                            { step: "03", title: t('forEmployers.hiringProcess.step3Title'), desc: t('forEmployers.hiringProcess.step3Desc') }
                        ].map((item, i) => (
                            <div key={i} className="text-center space-y-4">
                                <div className="text-4xl font-bold text-white/10">{item.step}</div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-brand-muted">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="p-12 text-center border-white/5 bg-white/[0.02]">
                    <h2 className="text-3xl font-bold mb-6">{t('forEmployers.cta.title')}</h2>
                    <p className="text-brand-muted text-lg max-w-2xl mx-auto mb-10">
                        {t('forEmployers.cta.desc')}
                    </p>
                    <Link to="/register">
                        <Button size="lg" className="rounded-full px-12 group">
                            {t('forEmployers.cta.button')}
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </Card>
            </section>
        </LandingLayout>
    );
}
