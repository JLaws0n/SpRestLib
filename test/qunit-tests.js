/*
 * NAME: qunit-test.js
 * DESC: tests for qunit-test.html (coded to the gitbrent O365 Dev Site)
 * AUTH: https://github.com/gitbrent/
 * DATE: 2016-12-27
 *
 // REALITY-CHECK:
 //QUnit.test("QUnit Base Test", function(assert){ assert.ok( true === true, "Passed!" ); });
 */
var RESTROOT = '/sites/dev';
var gNewEmpItem = -1;
var gTestUserId = 9;
var gUpdateItem = { Id:55 };

// ================================================================================================
QUnit.module( "USER Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.user().info()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.user().info()
		.then(function(objUser){
			assert.equal( objUser.Id		,9 													,"Pass: Id - " + objUser.Id );
			assert.equal( objUser.Email		,"admin@gitbrent.onmicrosoft.com"					,"Pass: Email - " + objUser.Email );
			assert.equal( objUser.LoginName	,"i:0#.f|membership|admin@gitbrent.onmicrosoft.com"	,"Pass: LoginName - " + objUser.LoginName );
			assert.equal( objUser.Title		,"Brent Ely"										,"Pass: Title - " + objUser.Title );
			done();
		});
	});
	QUnit.test("sprLib.user(#).info()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.user(gTestUserId).info()
		.then(function(objUser){
			assert.equal( objUser.Id		,gTestUserId 										,"Pass: Id    - " + objUser.Id );
			assert.equal( objUser.Email		,"admin@gitbrent.onmicrosoft.com"					,"Pass: Email - " + objUser.Email );
			assert.equal( objUser.LoginName	,"i:0#.f|membership|admin@gitbrent.onmicrosoft.com"	,"Pass: Login - " + objUser.LoginName );
			assert.equal( objUser.Title		,"Brent Ely"										,"Pass: Title - " + objUser.Title );
			done();
		});
	});

	QUnit.test("sprLib.user().groups()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.user().groups()
		.then(function(arrGroups){
			assert.ok( arrGroups.length > 0, "arrGroups is an Array, and length > 0: "+ arrGroups.length );
			done();
		});
	});
	QUnit.test("sprLib.user(#).groups()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.user(gTestUserId).groups()
		.then(function(arrGroups){
			assert.ok( arrGroups.length > 0, "arrGroups is an Array, and length > 0: "+ arrGroups.length );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "CRUD Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.list().create()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.create({
			__metadata: { type:"SP.Data.EmployeesListItem" },
			Name: 'Mr. SP REST Library',
			Badge_x0020_Number: 123,
			Hire_x0020_Date: new Date(),
			Salary: 12345.49,
			Utilization_x0020_Pct: 1.0,
			Extension: 1234,
			Comments: 'New employee created',
			Active_x003f_: true
		})
		.then(function(newObj){
			assert.ok( (newObj.Id), "Created! Id: " + newObj.Id );
			gNewEmpItem = newObj.Id;
			done();
		});
	});

	QUnit.test("sprLib.list().update() 1: with current etag   ", function(assert){
		var done = assert.async();
		// PREP:
		sprLib.list('Employees')
		.getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem", etag:gUpdateItem.__metadata.etag },
				id:         gUpdateItem.Id,
				Name:       'updated by sprLib.list().update() with etag'
			})
			.then(function(objItem){
				assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
				done();
			});
		});
	});
	QUnit.test("sprLib.list().update() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.update({
			__metadata: { type:"SP.Data.EmployeesListItem", etag:null },
			id:         gUpdateItem.Id,
			Name:       'updated by sprLib.list().update() with etag:null'
		})
		.then(function(objItem){
			assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
	QUnit.test("sprLib.list().update() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.update({
			__metadata: { type:"SP.Data.EmployeesListItem" },
			id:         gUpdateItem.Id,
			Name:       'updated by sprLib.list().update() w/o etag'
		})
		.then(function(objItem){
			assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
			done();
		});
	});

	QUnit.test("sprLib.list().delete() 1: with current etag   ", function(assert){
		var done = assert.async();
		// PREP:
		var gUpdateItem = {};
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:gUpdateItem.__metadata.etag },
				id: gUpdateItem.Id
			})
			.then(function(){
				assert.ok( (true), "Deleted!" );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// PREP:
		var gUpdateItem = {};
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:null },
				id: gUpdateItem.Id
			})
			.then(function(){
				assert.ok( (true), "Deleted!" );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// PREP:
		var numId = "'-1'";
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ numId = data[0].Id; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({ id:numId })
			.then(function(){
				assert.ok( (true), "Deleted!" );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "REST Methods" );
// ================================================================================================
{
	// REST endpoints that return `data.d.results` [{}]
	QUnit.test("sprLib.rest() ex: '/_api/web/sitegroups'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			restUrl: RESTROOT+'/_api/web/sitegroups',
			queryCols: {
				title: { dataName:'Title' },
				loginName: { dataName:'LoginName' },
				editAllowed: { dataName:'AllowMembersEditMembership' }
			}
			//,queryFilter:   "AllowMembersEditMembership eq 1"
			//,queryOrderby:  "Title"
			//,queryLimit: 10
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
	QUnit.test("sprLib.rest() ex: '/_api/web/lists'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({ restUrl:RESTROOT+'/_api/web/lists/' })
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].Id && arrayResults[0].Title), "arrayResults[0] is valid - Id: "+arrayResults[0].Id+" / Title: "+arrayResults[0].Title );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// REST endpoints that return `data.d` {}
	QUnit.test("sprLib.rest() ex: '/_api/web/lists/getbytitle(Employees)'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({ restUrl:RESTROOT+'/_api/web/lists/' })
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0]), "arrayResults[0] is valid - Id: "+ arrayResults[0] );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "LIST GET Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.getListItems() 1: no opts", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems()
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata), "arrayResults[0].__metadata exists: \n"+ JSON.stringify(arrayResults[0].__metadata) );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.getListItems() 2: w listCols", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: { title:{dataName:'Title'}, badgeNum:{dataName:'Badge_x0020_Number'} }
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata), "arrayResults[0].__metadata exists: \n"+ JSON.stringify(arrayResults[0].__metadata) );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// NEGATIVE TSET:
/*
sprLib.rest({ restUrl:'../_api/web/GetByTitle' });
*/


/*
QUnit.test("sprLib.getListItems() - onDone", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: { id:{dataName:'ID'} },
		queryMaxItems: 1,
		onDone: function(){ assert.ok( true, "onDone fired!" ); done(); }
	});
});

QUnit.test("sprLib.getListItems() - with listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: {
			id:       { dataName:'ID' },
			name:     { dataName:'Name' },
			badgeNum: { dataName:'Badge_x0020_Number' },
			hireDate: { dataName:'Hire_x0020_Date', dispName:'Hire Date', dataFormat:'INTL' },
			salary:   { dataName:'Salary' },
			extn:     { dataName:'Extension' },
			utilPct:  { dataName:'Utilization_x0020_Pct', dispName:'Util %' },
			comments: { dataName:'Comments' }
		},
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( (arrayResults[0].__metadata && typeof arrayResults[0].__metadata !== 'undefined'), "arrayResults[0] is valid -> __metadata: "+ arrayResults[0].__metadata );
			assert.ok( (arrayResults[0].id         && typeof arrayResults[0].name       !== 'undefined'), "arrayResults[0] is valid -> Id: "+arrayResults[0].id+" / Title: "+arrayResults[0].name );
			// TODO: Move to the (as yet undone) MODEL TEST section

			/ *
			QUnit.test("sprLib.model('Emp').data() method", function(assert){
				assert.ok( $.isArray(sprLib.model('Employees').data()), "sprLib.model().add().data() is an array" );
				assert.ok( $.isArray(sprLib.model('Employees').data('array')), "sprLib.model().add().data('array') is an array" );
				assert.ok( (typeof sprLib.model('Employees').data('object') === 'object'), "sprLib.model().add().data('object') is an object" );
			});
			* /
			done();
		}
	});
});

QUnit.test("sprLib.getListItems() - w/o listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( ( arrayResults[0].Id ), "arrayResults[0] is valid - Id: "+arrayResults[0].Id );
			QUnit.test("sprLib.model('Emp').data() method", function(assert){
				assert.ok( $.isArray(sprLib.model('Employees').data()), "sprLib.model().add().data() is an array" );
				assert.ok( $.isArray(sprLib.model('Employees').data('array')), "sprLib.model().add().data('array') is an array" );
				assert.ok( (typeof sprLib.model('Employees').data('object') === 'object'), "sprLib.model().add().data('object') is an object" );
			});
			done();
		}
	});
});

QUnit.test("sprLib.getListItems() - dataFunc listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: {
			name:     { dataName:'Name' },
			badgeNum: { dataName:'Badge_x0020_Number' },
			funcTest: { dataFunc:function(objItem){ return objItem.Name +' ('+ objItem.Badge_x0020_Number+')' } }
		},
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( ( arrayResults[0].badgeNum ), "arrayResults[0] is valid - badgeNum: " + arrayResults[0].badgeNum );
			assert.ok( ( arrayResults[0].funcTest ), "arrayResults[0] is valid - funcTest: " + arrayResults[0].funcTest );
			done();
		}
	});
});
*/

// ================================================================================================
//QUnit.module( "Binding / Forms" );
// ================================================================================================
// sprLib.model('Employees').syncItem()

// WORKS
/*
sprLib.model('junk').add({
	listName: '/sites/dev/_api/web/sitegroups',
	listCols: {
		title: { dataName:'Title' },
		loginName: { dataName:'LoginName' },
		editAllowed: { dataName:'AllowMembersEditMembership' }
	},
	onDone: function(data){ console.table(data) }
});
*/

/*
some API calls require an arguamnet (group/pr0file rest endpoints ets), require an auth toekn an POST!
ajaxType: "POST
*/


/*
howto test form/htmls
test(name, function() {
	var links = document.getElementById("qunit-fixture").getElementsByTagName("a");
	equal(links[0].innerHTML, "January 28th, 2008");
	equal(links[2].innerHTML, "January 27th, 2008");
	prettyDate.update(now);
	equal(links[0].innerHTML, first);
	equal(links[2].innerHTML, second);
});
*/
