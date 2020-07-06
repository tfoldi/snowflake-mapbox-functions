# snowflake-mapbox-functions
Snowflake-Mapbox integration using External Functions

## Deploying

Clone the repo, then edit `serverless.yml` with your snowflake account info, then:

```
sls deploy
```

## Using the function function 

In snowflake, execute:

```sql
select calc_distance('driving','-122.42,37.78','-77.03,38.91');
```

which should return with:

```json
{   "distance": 4528787.5,   "duration": 166612.281 }

```

# License

BSD-3-Clause

All rights reserved, Tamas Foldi, Starschema, 2020.
