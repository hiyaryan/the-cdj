import { FormControlLabel, Grid, List, ListItem, ListItemText, Switch, Typography } from '@mui/material';

import { useMemo, useState } from 'react';

import { useAccount } from '../../../../../contexts/useAccount';

const names = {
    fname: 'First name',
    lname: 'Last name',
    email: 'Email',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    model: 'Model',
};

export default function Review() {
    const [showSensitive, setShowSensitive] = useState(false);

    const { profile, password, config } = useAccount();
    const account = { ...profile, ...password, ...config };

    const updated = useMemo(() =>
        Object.entries(account)
            .filter(([key, value]) => (
                value !== undefined && value !== null) && names[key])
            .flatMap(([key, value]) => {
                // Handle nested model structure
                if (key === 'model' && typeof value === 'object') {
                    return Object.entries(value).map(([subKey, subValue]) => ({
                        name: `${ names[key] } (${ subKey })`,
                        desc: subValue,
                    }));
                }

                // Hide sensitive data unless toggled to show
                if ((key === 'oldPassword' || key === 'newPassword') && !showSensitive) {
                    return { name: names[key], desc: '******' };
                }

                return { name: names[key], desc: value };
            }),
        [account, showSensitive]
    );

    return (
        <>
            <Grid alignItems="center" container justifyContent="space-between">
                <Grid item>
                    <Typography gutterBottom variant="h6">
                        Review
                    </Typography>
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={<Switch checked={showSensitive} onChange={() => setShowSensitive(!showSensitive)} />}
                        label="Show sensitive data"
                        labelPlacement="start"
                    />
                </Grid>
            </Grid>
            <List disablePadding>
                {updated.map((item) => (
                    <ListItem key={item.name} sx={{ py: 1, px: 0 }}>
                        <ListItemText primary={item.name} secondary={item.desc} />
                    </ListItem>
                ))}
            </List>
        </>
    );
}
