'use strict';

module.exports = class Connection {
   constructor(connection, id) {
     this.connection = connection;
     this.id = id;
   }

   display() {
       console.log(this.firstName + " " + this.lastName);
   }
}
