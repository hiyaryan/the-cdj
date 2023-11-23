import { User, Journal } from '../../models/index.js';
import ExpressError from '../../utils/ExpressError.js';

import { validateJournal } from '../../middleware/validation.js';

import passport from 'passport';

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }

        if (!user) {
            // Handle login failure
            return next(new ExpressError(info.message, 401));
        }

        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // Handle successful login
            return res.status(200).json({ user: user });
        });
    })(req, res, next);
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
    const { fname, lname, email, password } = req.body;

    try {
        const newUser = await User.register(new User({ email: email, fname, lname }), password);

        // Prepare data for validateJournal, if necessary
        // e.g., req.body.journalData = { ... }

        // Call validateJournal middleware
        validateJournal(req, res, async (err) => {
            if (err) return next(err); // Handle validation errors

            // Continue with creating the journal if validation is successful
            const newJournal = new Journal.db({ user: newUser._id, title: req.body.title });
            await newJournal.save();

            // Continue with the rest of the registration process
            req.login(newUser, err => {
                if (err) return next(err);
                res.status(201).json({ user: newUser });
            });
        });
    } catch (err) {
        if (err.code === 11000) {
            return next(new ExpressError('Email already in use', 400));
        } else {
            return next(err);
        }
    }
};
