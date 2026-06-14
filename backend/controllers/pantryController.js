import Pantryitems from '../models/Pantryitems.js';

export const getPantryItems = async (req, res, next) => {
    try {
        const{ category, is_running_low, search } = req.query;
        const items = await Pantryitems.findByUserId(req.user.id,{
            category, is_running_low: is_running_low==='true'?true:undefined, search
        });
        res.status(200).json({ success: true, data: { items } });
    } catch (err) {      
        next(err);
    }   
};

export const getPantryStats = async (req, res, next) => {
    try {
        const stats = await Pantryitems.getStats(req.user.id);
        res.status(200).json({ success: true, data: { stats } });
    } catch (err) {
        next(err);
    }
};

export const getExpiringSoon= async (req, res, next) => {
    try{
        const days= parseInt(req.query.days) || 7;
        const items = await Pantryitems.getExpiringSoon(req.user.id, days);
        res.status(200).json({ success: true, data: { items } });
    } catch (err) {
        next(err);
    }
};

export const addPantryItem = async (req, res, next) => {
    try {
        const item = await Pantryitems.create(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Item added successfully', data: { item } });
    } catch (err) {
        next(err);
    }
};

export const updatePantryItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await Pantryitems.update(id, req.user.id, req.body);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Pantry item not found' });
        }
        res.status(200).json({ success: true, message: 'Pantry item updated successfully', data: { item } });
    } catch (err) {
        next(err);
    }
};

export const deletePantryItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item= await Pantryitems.delete(id, req.user.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Pantry item not found' });
        }
        res.status(200).json({ success: true, message: 'Pantry item deleted successfully' , data: { item }});
    } catch (err) {
        next(err);
    }
};