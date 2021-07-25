
class apiFeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter () {
        let removeQuery = [ "field", "sort", "pagination", "limit"];
        let queryObj = { ...this.queryString}
        removeQuery.forEach( el => delete queryObj[el]);

        // GEOPATIAL QUERY 
        if (queryObj.geoSpatial) {
            const [lat, lng, maxDistance]= queryObj.geoSpatial.split(',');

            queryObj = {
                ...queryObj,
                location: { $geoWithin: { $centerSphere: [ [ lng, lat ],
                         maxDistance / 3963.2 ]
                        }
                    }
                }

            delete queryObj.geoSpatial
               
        }

        if (queryObj.name) {
            const name = queryObj["name"];
            queryObj = {
                ...queryObj,
                name: { $regex:  name , $options: 'i'}
            
        }

    }
        
        queryObj  = JSON.stringify(queryObj);
        queryObj = JSON.parse(queryObj.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));

        console.log(queryObj, "QEURY")
        this.query = this.query.find(queryObj)

    
        return this
    }


    sort() {
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort.split(",").join(' ');
            this.query = this.query.sort(sortBy)
        } 
        return this 
        };

    field () {
        if (this.queryString.field) {
            let field = this.queryString.field.split(",").join(' ');
            this.query = this.query.select(field)
        }
        return this
    }


    paginate () {
        let page = this.queryString.page * 1|| 1;
        let limit = this.queryString.limit * 1|| 20;

        let skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        
        return this
        }


        
 

}


module.exports = apiFeature