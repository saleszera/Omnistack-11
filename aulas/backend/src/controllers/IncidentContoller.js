const connection = require('../database/connection');

module.exports = {
  async create(req, res){
    const {title, description, value} = req.body;
    const ong_id = req.headers.authorization;

    const [id] = await connection('incidents').insert({
      title,
      description,
      value,
      ong_id,
    });

    return res.json({id})
  },

  async index(req, res){
    const {page = 1} = req.query;

    const [count] = await connection('incidents').count();

    const incidents = await connection('incidents').limit(5).offset((page - 1) * 5).select('*');

    res.header('X-Total-Count', count['count(*)'])

    return res.json(incidents);
  },

  async delete(req, res){
    const {id} = req.params;
    const ong_id = req.headers.authorization;

    const incident = await connection('incidents')
      .where('id', id)
      .select('ong_id')
      .first();

    if(!incident){
      return res.status(404).json({Error: "Not found!"})
    }

    if(incident.ong_id !== ong_id){
      return res.status(401).json({Error: "Oparation not permited!"});
    }

    await connection('incidents').where('id', id).delete();

    return res.status(204).send();
  }
}
