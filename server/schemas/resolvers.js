const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password');

                return userData;
            } throw new AuthenticationError('Your Not Logged In Silly');
        },

        user: async () => {
            return User.find();
        },
        user: async (parent, { username }) => {
            return User.findOne({ username });
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true }
                );

                return updatedUser;
            }
            throw new AuthenticationError('You still need to be logged in!');
        },
        removeBook: async (parent,{ userId, bkId }, context) => {
            if (context.user) {
                const removeBook = await User.findOneAndUpdate(
                    { _id: userId },
                    { $pull: { savedBooks: { bookId: bkId } } },
                    { new: true }  
                );

                return removeBook;
            }

            throw new AuthenticationError('How many times do I have to tell you to log in?');
        }
    }
};

module.exports = resolvers;