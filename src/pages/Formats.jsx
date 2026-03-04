import { LandingLayout } from '../components/layout/LandingLayout';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Clock, Briefcase, GraduationCap, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Formats() {
    const { t } = useLanguage();

    const formats = [
        {
            title: t('formats.items.trialWeek.title'),
            icon: <Clock className="text-brand-orange" />,
            explanation: t('formats.items.trialWeek.desc'),
            forWho: t('formats.items.trialWeek.forWho'),
            badge: t('formats.items.trialWeek.badge')
        },
        {
            title: t('formats.items.fullTime.title'),
            icon: <Briefcase className="text-brand-orange" />,
            explanation: t('formats.items.fullTime.desc'),
            forWho: t('formats.items.fullTime.forWho'),
            badge: t('formats.items.fullTime.badge')
        },
        {
            title: t('formats.items.noExperience.title'),
            icon: <GraduationCap className="text-brand-orange" />,
            explanation: t('formats.items.noExperience.desc'),
            forWho: t('formats.items.noExperience.forWho'),
            badge: t('formats.items.noExperience.badge')
        },
        {
            title: t('formats.items.temporary.title'),
            icon: <Zap className="text-brand-orange" />,
            explanation: t('formats.items.temporary.desc'),
            forWho: t('formats.items.temporary.forWho'),
            badge: t('formats.items.temporary.badge')
        }
    ];

    return (
        <LandingLayout>
            <section className="px-6 py-20 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <Badge variant="orange" className="mb-4">{t('formats.badge')}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                        {t('formats.title').split(' ').map((word, i) =>
                            word.toLowerCase() === 'way' || word.toLowerCase() === 'способ' || word.toLowerCase() === 'yo\'lini'
                                ? <span key={i} className="text-brand-orange"> {word}</span>
                                : ' ' + word
                        )}
                    </h1>
                    <p className="text-brand-muted text-xl max-w-2xl mx-auto">
                        {t('formats.description')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {formats.map((format, index) => (
                        <Card key={index} className="p-8 hover:border-brand-orange/30 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-brand-orange/10 rounded-xl group-hover:scale-110 transition-transform">
                                    {format.icon}
                                </div>
                                <Badge variant="default" className="bg-white/5">{format.badge}</Badge>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{format.title}</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">{t('formats.labels.explanation')}</h4>
                                    <p className="text-white/80 leading-relaxed">
                                        {format.explanation}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">{t('formats.labels.whoItIsFor')}</h4>
                                    <p className="text-brand-muted">
                                        {format.forWho}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </LandingLayout>
    );
}
