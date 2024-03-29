import { Avatar, Box, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { AltRoute } from '@mui/icons-material';

import Copyright from '../../utils/Copyright';

import { useAccess } from '../../../hooks/useAccess';
import { useJournal } from '../../../contexts/useJournal';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
    const { setJournalId, setJournalTitle } = useJournal();
    const [isLoggingOut, setIsLoggingOut] = useState(true);

    const access = useAccess();
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await access(
                    '/logout',
                    'GET',
                );

                // Logout sequence
                let timer = setTimeout(() => {
                    setIsLoggingOut(false);
                }, 1000);

                timer = setTimeout(() => {
                    // Reset journal context
                    setJournalId('');
                    setJournalTitle('');

                    // Remove token and journal ID from local storage
                    localStorage.removeItem('token');

                    navigate('/login', { replace: true })
                }, 2000);

                return () => clearTimeout(timer);
            } catch (error) {
                console.error(error);
            }
        };

        handleLogout();
    }, [navigate]);

    return (<Container component="main" maxWidth="xs">
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: '' }}>
                <AltRoute />
            </Avatar>

            {isLoggingOut ? <Typography variant="h3">Logging out, please wait...</Typography> : <Typography variant="h1">Logged out</Typography>}
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
    );
}
