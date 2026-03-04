import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signUp(email, password, {
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-0 md:mb-12">
                    <Logo className="hidden md:block h-48 w-auto mx-auto mb-8 object-contain" />
                    <p className="hidden md:block text-brand-muted">Присоединяйтесь к нашему творческому сообществу.</p>
                </div>

                <div className="space-y-6">
                    <Card className="p-8 backdrop-blur-xl bg-brand-gray/50 border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Регистрация</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Имя"
                                    type="text"
                                    placeholder="Иван"
                                    className="bg-brand-black/50"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Фамилия"
                                    type="text"
                                    placeholder="Иванов"
                                    className="bg-brand-black/50"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                placeholder="ivan@example.com"
                                className="bg-brand-black/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Пароль"
                                type="password"
                                placeholder="Придумайте пароль"
                                className="bg-brand-black/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />



                            <Button className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-brand-muted">
                            Уже есть аккаунт?{' '}
                            <Link to="/login" className="text-brand-orange hover:text-orange-400 font-medium transition-colors">
                                Войти
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
