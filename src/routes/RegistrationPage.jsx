
import MuiCard from '@mui/material/Card';
import {
    Box,
    Button, Checkbox, Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Stack,
    styled,
    TextField,
    Typography,
    Link
} from "@mui/material";
import React from "react";
import {useNavigate} from "react-router-dom";
const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export function RegistrationPage() {


    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

    // Добавляем состояние для значений полей
    const [formData, setFormData] = React.useState({
        username: '',
        password: ''
    });

    // Сбрасываем форму при загрузке компонента
    React.useEffect(() => {
        setFormData({ username: '', password: '' });
    }, []);

    const navigate = useNavigate();


    const validateInputs = () => {



        let isValid = true;

        if (!formData.username || !/^[a-zA-Z0-9@._%+-]+$/.test(formData.username)) {
            setUsernameError(true);
            setUsernameErrorMessage('Попробуй придумать корректный username');
            isValid = false;
        } else {
            setUsernameError(false);
            setUsernameErrorMessage('');
        }

        if (!formData.password || formData.password.length < 8) {
            setPasswordError(true);
            setPasswordErrorMessage('Слишком короткий пароль....');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }



        return isValid;
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (usernameError || passwordError) {
            event.preventDefault();
            return;
        }

        const apiPath = "/auth/register";
        try {
            let body = JSON.stringify({
                username:formData.username,
                password:formData.password
            })
            const response = await fetch(apiPath, {method:"POST", body: body,
                headers: {"Content-Type": "application/json"}});



            const answerBody = await response.json();

            if (response.status===409){
                setUsernameError(true);
                setUsernameErrorMessage(answerBody.message);

                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            if (!response.ok){
                setUsernameError(true);
                setUsernameErrorMessage('Ошибка сервера');

                throw new Error(`HTTP error! Status: ${response.status}`);
            }







            // тут нужно передать некоторые данные для странички /login
            navigate("/login", { state: { usernameReceived: formData.username}});







        } catch (err) {


        } finally {


        }







        console.log(formData.username, formData.password, "from useState");




    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (

    <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">

            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Регистрация
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >

                <FormControl>
                    <FormLabel htmlFor="username">Имя</FormLabel>
                    <TextField
                        required
                        fullWidth
                        id="username"
                        placeholder="твое имя..."
                        name="username"
                        autoComplete="off"
                        variant="outlined"
                        error={usernameError}
                        helperText={usernameErrorMessage}
                        color={passwordError ? 'error' : 'primary'}
                        value={formData.username}
                        onChange={handleInputChange}

                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Пароль</FormLabel>
                    <TextField
                        required
                        fullWidth
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="off"
                        variant="outlined"
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        color={passwordError ? 'error' : 'primary'}

                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </FormControl>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={validateInputs}
                >
                    Зарегистрироваться
                </Button>
            </Box>
            <Divider>
                <Typography sx={{ color: 'text.secondary' }}>Или...</Typography>
            </Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                <Typography sx={{ textAlign: 'center' }}>
                    Уже есть учетка?{' '}
                    <Link
                        href="/login"
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Вход
                    </Link>
                </Typography>
            </Box>
        </Card>
    </SignUpContainer>
    )
}