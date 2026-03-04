
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-0 md:mb-12">
                    <Logo className="hidden md:block h-48 w-auto mx-auto mb-8 object-contain" />
                    <p className="hidden md:block text-brand-muted">С возвращением! Пожалуйста, войдите в свой аккаунт.</p>
                </div>

                <div className="space-y-6">
                    <Card className="p-8 backdrop-blur-xl bg-brand-gray/50 border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Вход</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Введите ваш email"
                                className="bg-brand-black/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Пароль"
                                type="password"
                                placeholder="Введите ваш пароль"
                                className="bg-brand-black/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-brand-muted hover:text-white cursor-pointer transition-colors">
                                    <input type="checkbox" className="mr-2 rounded border-white/20 bg-brand-black text-brand-orange focus:ring-brand-orange" />
                                    Запомнить меня
                                </label>
                            </div>

                            <Button className="w-full mt-2" size="lg" disabled={loading}>
                                {loading ? 'Вход...' : 'Войти'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-brand-muted">
                            Нет аккаунта?{' '}
                            <Link to="/register" className="text-brand-orange hover:text-orange-400 font-medium transition-colors">
                                Зарегистрироваться
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
