//import { facebookPassport } from '../authenticate';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ 'user': req.user._id })
            .populate('dishes')
            .populate('user')
            .exec((err, favorites) => {
                if (err)
                    return next(err);
                res.json(favorites);
            });
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user.id }, (err, favorite) => {
            if (err)
                return next(err);
            if (!favorite) {
                Favorites.create(req.body, (err, favorite) => {
                    if (err)
                        return next(err);
                    console.log('New Favorite Created!');
                    favorite.user = req.user.id;
                    console.log('Dish id: ', req.body._id);
                    favorite.dishes.push(req.body._id);
                    favorite.save((err, favorite) => {
                        if (err)
                            return next(err);
                        res.json(favorite);
                    })
                })
            }
            else {
                var dish = req.body._id;
                console.log('Dish id: ', dish);
                if (favorite.dishes.indexOf(dish) == -1) {

                    favorite.dishes.push(dish);
                }
                favorite.save((err, favorite) => {
                    if (err)
                        return next(err);
                    res.json(favorite);
                })
            }
        })
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ 'user': req.user.id }, (err, resp) => {
            if (err)
                return next(err);
            res.json(resp);
        })
    });

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
    .get(cors.cors,authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if(!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                if(favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "favorites": favorites })
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err)) 
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id }, (err, favorite) => {
            if (err)
                return next(err);
            if (!favorite) {
                Favorites.create(req.body, (err, favorite) => {
                    if (err)
                        return next(err);
                    console.log('New Favorite Created!');
                    favorite.user = req.user.id;
                    // console.log('Dish id: ', req.body._id);
                    favorite.dishes.push(req.params.dishId);
                    favorite.save((err, favorite) => {
                        if (err)
                            return next(err);
                        res.json(favorite);
                    })
                })
            }
            else {
                var dish = req.params.dishId;
                console.log('Dish id: ', dish);
                if (favorite.dishes.indexOf(dish) == -1) {
                    favorite.dishes.push(dish);
                }
                favorite.save((err, favorite) => {
                    if (err)
                        return next(err);
                    res.json(favorite);
                })
            }
        })
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) return next(err);

            var index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index,1);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    then((favorite) => {
                        console.log('Favorite Dish Deleted!');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/pain');
                res.end('Dish ' + req.params._id + ' not in your Favorite List');
            }
        })
    })


module.exports = favoriteRouter;