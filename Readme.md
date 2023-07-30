# Grid Renderer

## Algorithm/Steps

1.  The grid code is passed with props

2.  The helper object is initialized

    -   The props are passed to create new helper instance
    -   Helper has all the usefull functions which can be called and the functions can be overriden from the client and app level
    -   Helper also has the reducer state defination which can be used to create state and dispatch

3.  The helper is passed to the grid renderer

    -   state and dispatch are created with the defination present in helper
    -   state and dispatch are saved to helper

4.  init funtion is called after the states and dispatch are initiated

### init() Function

5.  Grid defination is fetched from the server with 'fetchGridDef' function

    -   Stored in gridDef state
    -   The formcode is set to the value fetched from server

6.  Header is processed with 'getColumnsDef' function to get the column defination and is soterd in columns

    -   If the header is not yet fetched the loading component is showed
    -   If the header has template option, single row is shown with the cell template attached to helper class form client files
        -   colum defination is fetched with 'getTemplatedColumnDef' function
    -   By default all rows has to be shows with the one extra row for actions to perform on row
        -   colum defination is fetched with 'getEachColumnDef' function
        -   action column defination fetched with 'getActionsColumnDef' function

7.  Stored preferences is fetched, when column is defined, from loaclstorage with 'getStored' function

    -   ### Stored prefs are ↙
    -   filter model
    -   sort model
    -   page number
    -   page size
    -   selected rows

8.  Based on the pagination mode the rows are fetched in different ways
    -   For both client side pagination, numbered and scroll, all the rows are fetched at once from the server
    -   For server side number based pagination the rows on the particular page is fetched
        -   If page is already fetched 'pageRowsStorage[page]' is marked true
    -   For server side virtual scrolling first 15 virtual rows are fetched and then next rows according to pageSize
    -   For both the above server based paginations when the sortmodel or filter model is changed
        -   ### function perform change based operation ↙
        -   all the rows and stored pages are reset
        -   the new rows are fetched based on the change

## Pagination Modes

    0 : No pagination
            - all the rows are fetched and displayed at once
    1 : Number based client side pagination
            - all the rows are fetched at once and shows in different pages
    2 : Number based server side pagination
            - the rows is fetched based on ↙
                page number, filters, sortings
            - fetched pages are also stored stored in seperate state
    3 : Virtual scroll server side pagination
            - the rows are fetched in steps based on ↙
                filter, sort, current rows count

## Pagination Based Props

#### for DataGrid

    pagination              - boolean, if grid need pagination      [1,2]
    paginationMode          - server/client                         [1,2]
    page                    - for page number                       [1,2]
    pageSize                - for rows count per page               [1,2]
    rowsPerPageOptions                                              [1,2]
    sortingMode             - server/client                         [1,2]
    filterMode              - server/client                         [1,2]
    ~on*Change              - handlers                              [1,2]
    onRowsScrollEnd         - funtion to be fired at scroll end       [3]

## Default props

#### for DataGrid

    ~data           - rows, columns
    Components      - To override the default DataGrid components
                        Toolbar, Footer etc.
    componentsProps - Passing props the the DataGrid components, and override components
    loading         - boolean, when to show loading overloay
    rowHeight       - overide default row height
    scrollbarSize   -
    rowCount        - to be shown in Total Rows
    rowHeight       - custom row height (prefered to display template based row)
    ~*Models        - models
    ~on*            - handlers
    ~on*ModelChange - handlers
    checkboxSelection   - boolean, whether to show checkbox option
    disableSelectionOnClick - to disable selection
                                when clicked on row other that checkbox
    -some other props
        Toolbar     - to override Toolbar component
        [ showActionButtons,
    	  showButtons,
    	  showGlobalSearch ] - booleans
    	showToolbarMenus - object {filter:boolean,density:boolean,columns:boolean,export:boolean} - for menus

## Function usages & working

-   fetchGridDef

    -   To fetch grid defination from server
    -   Set the gridDef state
    -   Set formCode state

-   getStored

    -   get the preferences of the current grid stored in local storage
    -   preferences includes
        -   filter model
        -   sort model
        -   page number
        -   page size
        -   selected rows

-   getColumnsDef

    -   converts header defination to the column defination for DataGrid
    -   sets the column state with the defination
    -   return loading column when there is no header
    -   retrun defination based on wheater the grid is template based or not

-   updateRows

    -   adds new rows to the existing
    -   overrides the rows with same id

-   search

    -   fetches new rows from the server
    -   calls update rows with new row
    -   returns if rows already fetched

-   getSortPayload

    -   convert sortModel to sort object to be sent with server payload
    -   takes initSort to add to the sortModel

-   getSearchPayload
    -   gives the payload with help of different factors
    -   skip nad take based on different pagination modes
    -   sorting, where(filters)
-   getWhere

    -   convert filterModel to where object to be sent with server payload
    -   takes initFilter and default filter to add to filterModel
    -   operatorMap - map of operator to convert operator according to server requirement

-   onChange handlers
    -   to handle the basic changes
    -   store the required preferences to local storage
-   event handlers

-   ToolbarJSX
    -   returns custom toolbar component to display on DataGrid
    -   Shows default data grid tools
        -   export
        -   columns show/hide
        -   filter ( can be hidden based on filterable property)
        -   density
    -   Shows buttons and action buttons based on the header defination
    -   Shows search box , based on 'searchable' boolean
    -   Shows loading skeleton if no header present
-   ActionButtonsJSX
    -   displayed on toolbar right of
    -   action buttons displayed when any row(s) are selected
    -   fires function mentioned in helper class from client file
    -   function will be fired with the arguments
        -   {event,selectionModel,name on function} # more can be added
        -   with the help of 'handleActionButtonClick' function
-   ButtonsJSX
    -   displayed on right of toolbar
    -   buttons displayed when any row(s) are selected
    -   fires function mentioned in helper class from client file
    -   function will be fired with the arguments
        -   {event,selectionModel,name on function} # more can be added
        -   with the help of 'handleActionButtonClick' function
-   RenderActionCellJSX

    -   Cell component to display custom action column in the grid
    -   contains the buttons which fires the function on respective row
    -   the hidden buttons are in menu, open when clicked more icon
    -   function will be fired with the arguments
        -   {event,id,function name} # more can be added
        -   with help of 'handleActionClick' function

-   getPercentageBoxJSX
    -   return the box with 100% of parent
    -   display the percentage bucket (width %)
-   getEachColumnDef
    -   gives the defination of each column based on the column data in header
    -   gives default properties from the header
    -   dataType based properties is overriden
    -   properties like renderCell is got from map
-   getTemplatedColumnDef
    -   given the column defination of the single column for the template based cell

## Constants

### columnType Map - the columns defination for DataGrid

    1   :   string
    2   :   number
    3   :   date
    4   :   dateTime
    5   :   boolean
    6   :   chip
    7   :   percentage
    8   :   fraction
    9   :   rating stars
    10  :   avatar
