/* eslint no-eval: 0 */

// #region Imports

// #region React Imports
import { useEffect, useState } from 'react';
// #endregion React Imports

// #region Package Imports
import _ from 'lodash';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import useFeParams from '@Lib/customHooks/useFeParams';
import Crypto from 'crypto-js';
// #endregion Package Imports

// #region Style Imports
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import BugReportIcon from '@mui/icons-material/BugReport';
import Icon from '@mui/material/Icon';
import FEDate from '@Lib/prototypes/feDate';

import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
// #endregion Style Imports

import Label from '@Lib/srcMinimal/components/label';

import { loaderActions } from '@Lib/loaders/renderer/store';

// #region FE - Library Imports
import { alertActions } from '@Lib/forms/helpers/stores/alert';
import GridRenderer from '@Lib/grids/gridRenderer';
import FE from '../globals/globals';
// import Icons from "../assets/Icons";
import Predicate from '../assets/predicate';
import useControllerDataService from '../sharedServices/controllerDataService';
// #endregion FE - Library Imports

// #region FE - Other Imports
// #endregion FE - Other Imports

// #endregion Imports

function formatIcon(icon) {
  try {
    const iconArr = icon.split('-');
    if (iconArr[0] === 'md') {
      return iconArr[1];
    }
  } catch (e) {
    console.log('ERR IN CONVERTING ICON ==>', e);
  }
  return icon;
}

function DefaultGrid(props) {
  const helper = props.getHelper();
  const actionDispatcher = useDispatch();
  const urlParams = useFeParams();
  const uiService = useControllerDataService();
  const [showFilterFlag, setShowFilterFlag] = useState(false);
  const [showDebuggerFlag, setShowDebuggerFlag] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const [queryData, setQueryData] = useState('');

  const [openRejReasonModal, setOpenRejReasonModal] = useState(false);
  const [rejReasonRecord, setRejReasonRecord] = useState(false);
  const [rejReason, setRejReason] = useState('');

  useEffect(() => {
    props.updateProps(props);
    props.methods.notifyParent(props.getPage());
    props.methods.setServices({
      urlParams, uiService, showFilterFlag, setShowFilterFlag, showDebuggerFlag, setShowDebuggerFlag, showQuery, setShowQuery, setQueryData, setOpenRejReasonModal, setRejReasonRecord,
    });
    props.methods.assignStateController({ actionDispatcher });

    /* 	async function __init() {
        await props.methods.initForm().catch((e) => {
          console.log('Error in form init:pre:', e)
          throw e;
        }).then(() => {
          setFormSchema(props.methods.getFormSchema());
          setFormSchemaFetched(true);
        }).catch((e) => console.log('Error in form init', e));
      };
      __init(); */
    // eslint-disable-next-line
  }, []);

  function closeQueryModal() {
    setShowQuery(false);
    setQueryData('');
  }

  const handleRejReasonDialogClose = () => {
    setOpenRejReasonModal(false);
    setRejReasonRecord(false);
    setRejReason('');
  };

  const handleRejReasonDialogSubmit = async () => {
    await helper._performRejectTask(rejReasonRecord, rejReason);
  };

  const handleRejReasonChange = (event) => {
    setRejReason(event.target.value);
  };

  const getRejectionReasonTemplate = () => (
    <Dialog open={openRejReasonModal} onClose={handleRejReasonDialogClose}>
      <DialogTitle>Please provide rejection reason.</DialogTitle>
      <DialogContent>
        <TextField
          value={rejReason}
          autoFocus
          margin="dense"
          id="rej_reason"
          label="Rejection Reason"
          type="email"
          fullWidth
          variant="standard"
          onChange={handleRejReasonChange}
          multiline
          maxRows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRejReasonDialogClose}>Cancel</Button>
        <Button onClick={handleRejReasonDialogSubmit}>Reject</Button>
      </DialogActions>
    </Dialog>
  );

  const rendererProps = {
    helper, initProps: props, showQuery, queryData, closeQueryModal, gridCode: props.code,
  };
  return (
    <>
      {helper ? <GridRenderer {...rendererProps} /> : <CircularProgress />}
      {getRejectionReasonTemplate()}
    </>
  );
}

class DefaultGridHelper {
  props;
  formCode;
  history;
  gridDef = {};
  paginationMode;
  refCode;
  showFilterFlag = false;
  showTemplateActions = true;

  /* reducer defination { start  */
  async dispatch(x) { }
  stateRef = {};
  initialStates = {
    search: '',
    gridDef: {},
    formCode: '',
    rowCount: 0,
    pageRowsStorage: {},
    paginationMode: 2,
    sortModel: [],
    filterModel: { items: [], operator: '' },
    selectionModel: [],
    page: 0,
    pageSize: 10,
    loadingRows: false,
    loadingColumns: false,
    columns: [],
    showActionColumn: true,
    showActionButtons: false,
    showGlobalSearch: false,
    showButtons: true,
    showToolbarMenus: {
      filter: true,
      density: true,
      columns: true,
      export: true,
      all: true,
    },
    rowsPerPageOptions: [10, 15, 25],
    rows: [],
    rowHeight: undefined,
  };
  stateReducers(state, action) {
    switch (action.type) {
      case 'SET_GRIDDEF':
        return { ...state, gridDef: action.gridDef };
      case 'SET_SHOW_ACTIONCOLUMN':
        return { ...state, showActionColumn: action.showActionColumn };
      case 'SET_SHOW_ACTIONBUTTONS':
        return { ...state, showActionButtons: action.showActionButtons };
      case 'SET_SHOW_BUTTONS':
        return { ...state, showButtons: action.showButtons };
      case 'SET_FORMCODE':
        return { ...state, formCode: action.formCode };
      case 'SET_LOADING_ROWS':
        return { ...state, loadingRows: action.loading };
      case 'SET_LOADING_COLUMNS':
        return { ...state, loadingColumns: action.loading };
      case 'SET_SEARCH':
        return { ...state, search: action.search };
      case 'SET_ROWS':
        return { ...state, rows: action.rows };
      case 'RESET_ROWS':
        return { ...state, rows: [] };
      case 'SET_ROSCOUNT':
        return { ...state, rowCount: action.rowCount };
      case 'SET_COLUMNS':
        return { ...state, columns: action.columns };
      case 'ADD_PAGEROWS':
        const newPageRows = { ...state.pageRowsStorage, [action.index]: action.isLoaded };
        return { ...state, pageRowsStorage: newPageRows };
      case 'RESET_PAGEROWS':
        return { ...state, pageRowsStorage: {} };
      case 'SET_PAGINATIONMODE':
        return { ...state, paginationMode: action.paginationMode };
      case 'SET_ROWSPERPAGEOPTIONS':
        return { ...state, rowsPerPageOptions: action.rowsPerPageOptions };
      case 'SET_PAGE':
        return { ...state, page: action.page };
      case 'SET_FILTER':
        return { ...state, filterModel: action.filterModel };
      case 'SET_SORT':
        return { ...state, sortModel: action.sortModel };
      case 'SET_PAGESIZE':
        return { ...state, pageSize: action.pageSize };
      case 'SET_SELECTION':
        return { ...state, selectionModel: action.selectionModel };
      case 'SET_ROWHEIGHT':
        return { ...state, rowHeight: action.rowHeight };
      default:
        return this?.reducerWrapper?.(state, action) ?? { ...state };
    }
  }
  _bindExposedMethods() {
    this.exposedMethods = {
      notifyParent: this.notifyParent.bind(this),
      setServices: this.setServices.bind(this),
      assignStateController: this.assignStateController.bind(this),
    };
  }
  setLoadingRows(loading) {
    this.stateRef.current.loadingRows = loading;
    this.dispatch({ type: 'SET_LOADING_ROWS', loading });
  }
  setFormCode(formCode) {
    this.formCode = formCode;
    this.stateRef.current.formCode = formCode;
    this.dispatch({ type: 'SET_FORMCODE', formCode });
  }
  setFormSchema(gridDef) {
    this.gridDef = gridDef;
    this.stateRef.current.gridDef = gridDef;
    this.dispatch({ type: 'SET_GRIDDEF', gridDef });
  }
  setLoadingColumns(loading) {
    this.stateRef.current.loadingColumns = loading;
    this.dispatch({ type: 'SET_LOADING_COLUMNS', loading });
  }
  setShowActionColumn(showActionColumn) {
    this.stateRef.current.showActionColumn = showActionColumn;
    this.dispatch({ type: 'SET_SHOW_ACTIONCOLUMN', showActionColumn });
  }
  setShowActionButtons(showActionButtons) {
    this.stateRef.current.showActionButtons = showActionButtons;
    this.dispatch({ type: 'SET_SHOW_ACTIONBUTTONS', showActionButtons });
  }
  setShowButtons(showButtons) {
    this.stateRef.current.showButtons = showButtons;
    this.dispatch({ type: 'SET_SHOW_BUTTONS', showButtons });
  }
  setPage(page) {
    this.stateRef.current.page = page;
    this.dispatch({ type: 'SET_PAGE', page });
  }
  setFilterModel(filterModel) {
    this.stateRef.current.filterModel = filterModel;
    this.dispatch({ type: 'SET_FILTER', filterModel });
  }
  setSortModel(sortModel) {
    this.stateRef.current.sortModel = sortModel;
    this.dispatch({ type: 'SET_SORT', sortModel });
  }
  setPageSize(pageSize) {
    this.stateRef.current.pageSize = pageSize;
    this.dispatch({ type: 'SET_PAGESIZE', pageSize });
  }
  setSelectionModel(selectionModel) {
    this.stateRef.current.selectionModel = selectionModel;
    this.dispatch({ type: 'SET_SELECTION', selectionModel });
  }
  async setRows(rows) {
    this.stateRef.current.rows = rows;
    await this.dispatch({ type: 'SET_ROWS', rows });
  }
  resetRows() {
    this.stateRef.current.rows = [];
    this.dispatch({ type: 'RESET_ROWS' });
  }
  async setRowsCount(rowCount) {
    this.stateRef.current.rowCount = rowCount;
    await this.dispatch({ type: 'SET_ROSCOUNT', rowCount });
  }
  setColumns(columns) {
    this.stateRef.current.columns = columns;
    this.dispatch({ type: 'SET_COLUMNS', columns });
  }
  setPageRowsStorage(index = 0, isLoaded = true) {
    this.stateRef.current.pageRowsStorage[index] = isLoaded;
    this.dispatch({ type: 'ADD_PAGEROWS', isLoaded: true, index });
  }
  resetPageRowsStorage() {
    this.stateRef.current.pageRowsStorage = {};
    this.dispatch({ type: 'RESET_PAGEROWS' });
  }
  setPaginationMode(paginationMode) {
    this.stateRef.current.paginationMode = paginationMode;
    this.dispatch({ type: 'SET_PAGINATIONMODE', paginationMode });
  }
  setRowsPerPageOptions(rowsPerPageOptions) {
    this.stateRef.current.rowsPerPageOptions = rowsPerPageOptions;
    this.dispatch({ type: 'SET_ROWSPERPAGEOPTIONS', rowsPerPageOptions });
  }
  setSearch(setSearch) {
    this.stateRef.current.setSearch = setSearch;
    this.dispatch({ type: 'SET_SEARCH', setSearch });
  }
  reducerWrapper(state, action) {
    return state;
  }

  assignStateController({ actionDispatcher, dispatch, stateRef }) {
    if (actionDispatcher) {
      this.actionDispatcher = actionDispatcher;
    }
    if (dispatch) {
      this.dispatch = dispatch;
    }
    if (stateRef) {
      this.stateRef = stateRef;
    }
  }
  setServices(services) {
    this.uiService = services.uiService;
    this.showFilterFlag = services.showFilterFlag;
    this.setShowFilterFlag = services.setShowFilterFlag;
    this.showDebuggerFlag = services.showDebuggerFlag;
    this.setShowDebuggerFlag = services.setShowDebuggerFlag;
    this.showQuery = services.showQuery;
    this.setShowQuery = services.setShowQuery;
    this.setQueryData = services.setQueryData;
    this.setOpenRejReasonModal = services.setOpenRejReasonModal;
    this.setRejReasonRecord = services.setRejReasonRecord;
    this.urlParams = services.urlParams;
  }
  /* end } reducer defination */

  /* get Reducer's states  { */
  get states() {
    return this.stateRef?.current ?? {};
  }
  get rows() {
    return this.stateRef?.current?.rows;
  }
  get columns() {
    return this.stateRef?.current?.columns;
  }
  get page() {
    return this.stateRef?.current?.page;
  }
  get loadingRows() {
    return this.stateRef?.current?.loadingRows;
  }
  get pageSize() {
    return this.stateRef?.current?.pageSize;
  }
  get rowCount() {
    return this.stateRef?.current?.rowCount;
  }
  get pageRowsStorage() {
    return this.stateRef?.current?.pageRowsStorage;
  }
  get sortModel() {
    return this.stateRef?.current?.sortModel;
  }
  get filterModel() {
    return this.stateRef?.current?.filterModel;
  }
  get selectionModel() {
    return this.stateRef?.current?.selectionModel;
  }
  get showActionColumn() {
    return this.stateRef?.current?.showActionColumn;
  }
  /* } get Reducer's states */

  /* other get { */
  get pageObj() {
    return this.props.getPage();
  }
  get code() {
    return this.props.code;
  }
  get reference() {
    return this.props.refCode;
  }

  get cProps() {
    let controller = this.props?.getPage();
    if (controller.isController !== true) {
      controller = this.props?.getPage().controller;
    }
    return controller;
  }

  get controller() {
    return this.props.getPage()?.controller?.cProps?.controller;
  }
  getListUrl() {
    // @ts-ignore
    const url = `${FE.urls.apiUrl}/${this.cProps.moduleName}/${this.cProps.controllerName}/list`;
    return url;
  }
  /* get listUrl() {
    // @ts-ignore
    const url = FE.urls.apiUrl + `/${this.cProps.moduleName}/${this.cProps.controllerName}/list`;
    return url;
  } */
  get performTaskUrl() {
    // @ts-ignore
    const url = `${FE.urls.apiUrl}/${this.cProps.moduleName}/${this.cProps.controllerName}/perform-task`;
    return url;
  }
  /* extendes rducer { */
  async setRowCount(rowCount, totalRowCount) {
    if (this.paginationMode === 3 && typeof totalRowCount === 'number') { rowCount = totalRowCount; }
    await this.setRowsCount(rowCount);
  }
  /* } extendes rducer */

  /* assignments { */
  assignDisplayToast(displayToast) {
    this.displayToast = displayToast;
  }
  assignCache(cache) {
    this.cache = cache;
  }
  assignActionDispatcher(actionDispatcher) {
    this.actionDispatcher = actionDispatcher;
  }
  assingApiRef(apiRef) {
    this.apiRef = apiRef;
  }
  assignLocation(location) {
    this.location = location;
  }
  assignHistory(history) {
    this.history = history;
  }
  assignSetIsDataLoading(setIsDataLoading) {
    this.setIsDataLoading = setIsDataLoading;
  }
  assignTemplateSelection(getModel) {
    this.getTemplateSelectionModel = getModel;
  }
  /* } assignments */

  /* constructor { */

  preConstructor() { }

  postConstructor() { }

  /* } constructor */

  resetGridRows() {
    this.resetPageRowsStorage();
    this.resetRows();
    this.setPage(0);
    this.setRowCount(0);
  }

  reloadGrid() {
    this.resetGridRows();
    return this._search();
  }

  /* init { */

  preInit() { }
  async initGrid(_) {
    this.preInit();
    await this.fetchGridDef();
    await this.getColumnsDef();
    // await this.getStored();
    await this._search();
    this.postInit();
  }
  postInit() { }

  constructor(props) {
    props && (this.props = props);
  }

  initHelper() {
    this._bindExposedMethods();
    this.preConstructor();
    this.refCode = this.props.refCode;
    if (typeof this.props.paginationMode !== 'number') {
      this.props.paginationMode = 2;
    }
    this.initialStates.paginationMode = this.props.paginationMode;
    this.paginationMode = this.props.paginationMode;
    this.postConstructor();
  }

  updateProps(props) {
    this.props = props;
  }

  initComponent(props, options) {
    for (const key in options) {
      this[key] = options[key];
    }
  }
  /* } init */

  notifyParent(pageObj) {
    if ((this.props.parentType >= 1 || this.props.parentType <= 3) && this.props.attachToParent) {
      this.props.attachToParent(this.props.refCode || this.props.code, this);
      if (!this.props.refCode) {
        console.log(`No "refCode" found for ${this.props.code}`);
      }
      // throw error
      console.log(`No "pageObj" found for ${this.props.code}`);
    } else if (pageObj) {
      this.props.attachToPage(this.props.refCode || this.props.code, this);
      if (!this.props.refCode) {
        console.log(`No "refCode" found for ${this.props.code}`);
      }
    } else {
      console.log(`No "pageObj" found for ${this.props.code}`);
    }
  }

  /* init functions { */
  getStored() {
    // get stored preferences from local storage
    try {
      const filter = JSON.parse(
        localStorage.getItem(`${this.props.code}_filterModel`),
      );
      if (filter) this.setFilterModel(filter);
    } catch (error) { }
    try {
      const sort = JSON.parse(
        localStorage.getItem(`${this.props.code}_sortModel`),
      );
      if (sort) this.setSortModel(sort);
    } catch (error) { }
    try {
      const selection = JSON.parse(
        localStorage.getItem(`${this.props.code}_selectionModel`),
      );
      if (selection) this.setSelectionModel(selection);
    } catch (error) { }
    try {
      const page = +JSON.parse(
        localStorage.getItem(`${this.props.code}_page`),
      );
      if (page) this.setPage(page);
    } catch (error) { }
    try {
      const pageSize = +JSON.parse(
        localStorage.getItem(`${this.props.code}_pageSize`),
      );
      if (pageSize) this.setPageSize(pageSize);
    } catch (error) { }
  }

  async fetchGridDef() {
    // fetch gridDef data from server
    this.setLoadingColumns(true);
    try {
      // @ts-ignore
      let gridDef;
      const gridCode = this.props.code;
      // if (this.cache.fetch('gridDef', gridCode)) {
      //   gridDef = this.cache.fetch('gridDef', gridCode);
      // } else {
      const url = `${FE.urls.backendUrl}/grid?gridCode=${this.props.code}`;
      const res = await FE.http(url);
      gridDef = res.data;
      // this.cache.add('gridDef', gridCode, gridDef);
      // }
      const data = this.transformGridSchema(gridDef);
      // this.setPaginationMode((x) => x); // change pagination mode if ..
      this.setFormCode(data.formCode); // set the form code
      this.setFormSchema(data);
    } catch (error) {
      console.log(error);
    }
    this.setLoadingColumns(false);
    // this.actionDispatcher(loaderActions.hideLoader());
  }

  transformGridSchema(gridSchema) {
    return gridSchema;
  }

  getColumnsDef() {
    const { gridDef } = this;
    //  get ColumnDef
    // convert gridDef to datagrid columns
    if (!gridDef || (!gridDef.columns && gridDef.template !== 1)) {
      // when there is no gridDef data
      return [{ field: 'Loading ...', width: 600 }];
    }
    if (gridDef.template === 1) {
      // template based gird , tamplate file saved in server
      // template is the react component which whose file is in ../../template
      // and is attached to helper in client files
      const cols = this.getTemplatedColumnDef();
      this.setColumns?.(cols);
      return cols;
    }
    // not templtae based
    // for each column
    const cols = gridDef.columns.map((column) => this.getEachColumnDef({ column }));
    // to add action buttons column
    if (this.showActionColumn) {
      cols.push(this.getActionsColumnDef());
    }
    this.setColumns?.(cols);
    return cols;
  }

  /* } init functions */

  /* predicates { */

  addConditionOnFilters(predicates, condition = 'and') {
    if (predicates instanceof Predicate) {
      predicates = [predicates];
    }
    let returnFilter;
    if (condition === 'or') {
      returnFilter = Predicate.or(predicates);
    } else {
      returnFilter = Predicate.and(predicates);
    }
    return returnFilter;
  }
  getFilterForColumn(
    field,
    value,
    operator = 'equal',
    ignoreCase,
    ignoreAccent,
  ) {
    return new Predicate(field, operator, value, ignoreCase, ignoreAccent);
  }

  /* } predicates */

  /* updateRows { */

  async updateRows(rows) {
    let updatedRows = _.cloneDeep(this.rows);
    if (Array.isArray(rows)) {
      if (Array.isArray(updatedRows) && updatedRows.length > 0) {
        const rowIdToIndexMap = {};
        rows.forEach((row, index) => {
          rowIdToIndexMap[row.id] = index;
        });
        updatedRows.forEach((row, index) => {
          const resolvedValueIndex = rowIdToIndexMap[row.id];
          if (typeof resolvedValueIndex === 'number') {
            updatedRows[index] = rows[resolvedValueIndex];
            delete rowIdToIndexMap[row.id];
          }
        });
        Object.keys(rowIdToIndexMap).forEach((key) => {
          const resolvedValueIndex = rowIdToIndexMap[key];
          updatedRows.push(rows[resolvedValueIndex]);
        });
      } else {
        updatedRows = rows;
      }
    }
    await this.setRows(updatedRows);
    return updatedRows.length;
  }
  updateRowsPreHook() {
    return true;
  }
  updateRowsPostHook() {
    return true;
  }

  /* } updateRows */

  /* search { */
  async searchPreHook(searchParams) {
    return searchParams;
  }
  async _searchPreHook(searchParams) {
    if (this.props.getPage()?._gridSearchPreHook?.(this, this.props.refCode || this.props.code, searchParams)) {
      return await this.searchPreHook(searchParams);
    }
    return true;
  }
  async _search(initFilters, initSort, initSkip, initTake) {
    const searchParams = {
      initFilters, initSort, initSkip, initTake,
    };
    if (this.loadingRows) return;
    if (!(await this._searchPreHook(searchParams))) {
      return;
    }
    const values = await this.search(searchParams);
    if (this.setIsDataLoading) {
      this.setIsDataLoading(false);
    }
    return await this._searchPostHook(values.rows, values.count);
  }

  async search({
    initFilters, initSort, initSkip, initTake,
  }) {
    const { page } = this;
    if (this.paginationMode === 2 && this.pageRowsStorage[page]) {
      const from = page * this.pageSize;
      return { rows: this.rows.slice(from, from + this.pageSize), rowCount: this.rowCount };
    }
    this.setPageRowsStorage(page);
    const payload = this.getSearchPayload(
      initFilters,
      initSort,
      initSkip,
      initTake,
    );
    const url = this.listUrl;
    this.setLoadingRows(true);
    const searchData = await FE.http(url, 'POST', payload);
    const values = JSON.parse(JSON.stringify(searchData)).data.data;
    this.updateRowsPreHook();
    const totalRowCount = await this.updateRows(values.rows);
    await this.setRowCount(values.count, totalRowCount);
    this.updateRowsPostHook();
    this.setLoadingRows(false);
    return values;
  }

  async _searchPostHook(rows = [], count = 0) {
    if (this.props.getPage()?._gridSearchPostHook?.(this, this.props.refCode || this.props.code, rows, count)) {
      return await this.searchPostHook(rows, count);
    }
    return { rows, count };
  }
  async searchPostHook(rows, count) {
    return rows;
  }

  /* } search */

  /* hooks { */
  navigateToNewPath(newPath) {
    try {
      let newUrl = this.getActualNavigationUrl(newPath, 'NEW');
      newUrl = this.pageObj._gridAddNewHook(this, this.code, newUrl);
      this.pageObj.navigate(newUrl, 'GRD');
    } catch (error) {
      console.log(error);
    }
  }

  navigateToEditPath(id, editPath) {
    try {
      let editUrl = this.getActualNavigationUrl(editPath, 'EDIT');
      editUrl.primaryUrl = this.extractRouteFromEditUrl(editUrl.primaryUrl);
      editUrl = this.pageObj._gridEditHook(this, this.code, editUrl, id);
      this.pageObj.navigateToEditUrl(editUrl, id);
    } catch (error) {
      console.log(error);
    }
  }

  navigateToCloseUrl() {
    try {
      const { closePath } = this.getRouteMapping();
      this.navigateToClosePath(closePath);
    } catch (error) {
      console.log('some error occured', error);
    }
  }

  navigateToClosePath(closePath) {
    try {
      let closeUrl = this.getActualNavigationUrl(closePath, 'CLS');
      closeUrl = this.pageObj._gridNavigationCloseUrl(this, this.code, closeUrl);
      this.pageObj.navigateToCloseUrl(closeUrl);
    } catch (error) {
      console.log(error);
    }
  }

  getActualNavigationUrl(pathData, mode) {
    const actualUrl = {
      primaryUrl: '',
      secondaryUrl: {
        parentUrl: '',
        outletCode: '',
        outletPath: '',
      },
    };
    // if (pathData && pathData.page) {
    //     let { page: pageCode, route: pageRoute } = pathData;
    //     let componentPath = this.pageObj.controller.getRouteMappingForPage(pageCode);

    //     if (!pageRoute) {
    //         actualUrl.primaryUrl = componentPath.url;
    //     } else {
    //         let extendedUrl = componentPath.action_mapping[pageRoute].url;
    //         actualUrl.primaryUrl = `${componentPath.url}/${extendedUrl}`;
    //     }

    //     if (componentPath['nav_type'] == navigationType.dialogNav) {
    //         this.pageObj.controller.isOpenDialog = true;
    //         actualUrl.secondaryUrl.parentUrl = this.getParentPath(actualUrl.primaryUrl, mode);
    //         actualUrl.secondaryUrl.outletCode = componentPath.outlet || "DRO";
    //         actualUrl.secondaryUrl.outletPath = this.getOutletPath(actualUrl.primaryUrl, mode);
    //     }
    //     if (!!this.pageObj.controller['parentController']) {
    //         actualUrl.primaryUrl = this.pageObj.controller.parentController['baseNavUrl'] + componentPath['url'];
    //     }
    // }
    return actualUrl;
  }

  // getParentPath(url, mode) {
  //     let parentLastIndex = parseInt(url.match('index')['index']) + 5;
  //     return url.substr(0, parentLastIndex);
  // }
  // getOutletPath(url, mode) {
  //     let outletStartingIndex = parseInt(url.match('index')['index']) + 6;
  //     if (mode == 'EDIT') {
  //         return url.substr(outletStartingIndex).split('/:id')[0];
  //     }
  //     return url.substr(outletStartingIndex);
  // }

  getRouteMapping() {
    try {
      const { controller } = this.pageObj;
      let routeMapping = controller.getRouteMappingForItem(this.pageObj.code, this.reference);
      if (!routeMapping) {
        routeMapping = controller.getRouteMappingByGridCode(this.pageObj.code, this.code);
      }
      return routeMapping;
    } catch (e) {
      console.log('some error occured', e);
    }
  }

  extractRouteFromEditUrl(editUrl) {
    console.log(editUrl.split('/:id'));
    const url = editUrl.split('/:id')[0];
    return url;
  }

  navigateToForm(args) {
    this.pageObj.controller.navigateToForm(args);
  }

  navigateToModule(args) {
    this.pageObj.navigateToModule(args);
  }

  async _openDialogForReason() {
    // this.isrejCommentModal = true;
    return 'Message';
  }

  onSubmit() {
    // this.submit$.next(true);
    // this.isrejCommentModal = false;
    // this.rejComment = undefined;
  }

  onDialogClose() {
    // this.submitChange$ && this.submitChange$.unsubscribe();
    // this.rejComment = undefined;
    // this.isrejCommentModal = false;
  }

  getTaskActionPayload(id, action, comments) {
    let payload = {};
    payload.data = [{ id }];
    payload.options = { action, comments };
    payload.formCode = this.formCode;

    payload = this.postTaskPayload(payload);

    return payload;
  }

  async postTaskPayload(payload) {
    return payload;
  }

  getTaskBulkActionPayload(selectedRowsData, action, comments) {
    let payload = {};
    payload.data = selectedRowsData.map((selectedRowData) => ({ id: selectedRowData }));
    payload.options = { action, comments };
    payload.formCode = this.formCode;

    payload = this.postTaskBulkPayload(payload);

    return payload;
  }

  async postTaskBulkPayload(payload) {
    return payload;
  }

  async getTaskUrlHook() {
    return this.performTaskUrl;
  }

  async performApproveTask(event) {
    const rowId = event.row.id;
    if (!rowId) {
      return false;
    }

    const url = await this.getTaskUrlHook();

    const payload = await this.getTaskActionPayload(rowId, 'APR');
    const ret = await FE.http(url, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  }

  async performRejectTask(event) {
    const rowId = event.row.id;
    if (!rowId) {
      return false;
    }
    this.setRejReasonRecord(rowId);
    return this.setOpenRejReasonModal(event);
  }

  async _performRejectTask(rowId, comments) {
    if (!rowId) {
      return false;
    }

    const payload = await this.getTaskActionPayload(rowId, 'REJ', comments);
    const url = await this.getTaskUrlHook();
    const ret = await FE.http(url, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
      this.setOpenRejReasonModal(false);
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  }

  async performSendBackTask(event) {
    const rowId = event.row.id;
    if (!rowId) {
      return false;
    }

    const payload = await this.getTaskActionPayload(rowId, 'SEND_BACK');
    const ret = await FE.http(this.performTaskUrl, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  }

  async performSendBackToRequestorTask(event) {
    const rowId = event.row.id;
    if (!rowId) {
      return false;
    }

    const payload = await this.getTaskActionPayload(rowId, 'SEND_BACK_TO_REQUESTOR');
    const ret = await FE.http(this.performTaskUrl, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  }

  approveAllTask = async () => this.performApproveBulkTask();

  performApproveBulkTask = async () => {
    const gridRowsData = this.getSelectedRowsIds({ inclueNull: false });
    if (!(gridRowsData && gridRowsData.length > 0)) {
      this.actionDispatcher(alertActions.showAlert({ message: 'Please select a record to perform action.', severity: 'error' }));
      return false;
    }
    const payload = await this.getTaskBulkActionPayload(gridRowsData, 'APR');
    const url = await this.getTaskUrlHook();

    const ret = await FE.http(url, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  };

  rejectAllTask = async () => this.performRejectBulkTask();

  performRejectBulkTask = async () => {
    const gridRowsData = this.getSelectedRowsIds({ inclueNull: false });
    if (!(gridRowsData && gridRowsData.length > 0)) {
      this.actionDispatcher(alertActions.showAlert({ message: 'Please select a record to perform action.', severity: 'error' }));
      return false;
    }
    const payload = await this.getTaskBulkActionPayload(gridRowsData, 'REJ');
    const url = await this.getTaskUrlHook();

    const ret = await FE.http(url, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  };

  sendBackAllTask = async () => this.performSendBackBulkTask();

  performSendBackBulkTask = async () => {
    const gridRowsData = this.getSelectedRowsIds({ inclueNull: false });
    if (!(gridRowsData && gridRowsData.length > 0)) {
      this.actionDispatcher(alertActions.showAlert({ message: 'Please select a record to perform action.', severity: 'error' }));
      return false;
    }
    const payload = await this.getTaskBulkActionPayload(gridRowsData, 'SEND_BACK');
    const ret = await FE.http(this.performTaskUrl, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  };

  async sendBackToAllEmployeeTask() {
    return this.performSendBackToRequestorBulkTask.apply(this, arguments);
  }

  async performSendBackToRequestorBulkTask() {
    const gridRowsData = this.getSelectedRowsIds({ inclueNull: false });
    if (!(gridRowsData && gridRowsData.length > 0)) {
      this.actionDispatcher(alertActions.showAlert({ message: 'Please select a record to perform action.', severity: 'error' }));
      return false;
    }
    const payload = await this.getTaskBulkActionPayload(gridRowsData, 'SEND_BACK_TO_REQUESTOR');
    const ret = await FE.http(this.performTaskUrl, 'PUT', payload).then((responseObj) => {
      const response = responseObj.data;
      if (response.err && response.err.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.err.join('<br>'), severity: 'error' }));
        return false;
      } if (response.message && response.message.length > 0) {
        this.actionDispatcher(alertActions.showAlert({ message: response.message.join('<br>') }));
      }
      this.reloadGrid();
    }).catch(((err) => {
      console.log('Error', err);
    }));
    return ret;
  }

  /* } hooks */

  /* search functions { */

  getSearchPayload(initFilters, initSort, initSkip, initTake) {
    const payload = {};
    payload.formCode = this.formCode;
    payload.gridCode = this.props.code;
    payload.where = this.getWhere(initFilters);
    payload.where = this._transformWhereClause(payload.where);
    payload.sorting = this.getSorting(initSort);
    payload.requiresCounts = true;
    if (this.paginationMode === 2) {
      payload.skip = initSkip ?? this.page * this.pageSize;
      payload.take = initTake ?? this.pageSize;
    }
    if (this.paginationMode === 3) {
      const { rowCount } = this;
      payload.skip = initSkip ?? rowCount;
      payload.take = initTake ?? this.pageSize;
      if (
        rowCount === 0
        && this.pageSize < 15
        && typeof initTake !== 'number'
      ) {
        payload.take = 15;
      }
    }
    if (this.paginationMode === 0 || this.paginationMode === 1) {
      payload.skip = initSkip ?? 0;
      payload.take = initTake ?? 50000;
    }
    return payload;
  }

  getSorting(initSort) {
    const { sortModel } = this;
    let sort = [];
    if (sortModel?.length > 0) {
      sort = sortModel.map((v) => ({
        name: v.field,
        direction: v.sort === 'asc' ? 'ascending' : 'descending',
      }));
    }
    sort = [...sort, ...(initSort ?? [])];
    return sort;
  }

  _transformWhereClause(where) {
    return this.transformWhereClause(where);
  }

  transformWhereClause(where) {
    return where;
  }

  getWhere(initFilters = undefined) {
    const pWhere = this.getDefaultSearchFilters();
    let where;
    const { filterModel } = this;
    if (filterModel?.items?.[0]?.value) {
      const operatorMap = {
        contains: 'contains',
        equals: 'equal',
        startsWith: 'startswith',
        endsWith: 'endswith',
        isEmpty: '',
        isNotEmpty: '',
        '>': 'greaterthan',
        '<': 'lessthan',
        '>=': 'greaterthanorequal',
        '<=': 'lessthanorequal',
        '!=': 'notequal',
        '=': 'equal',
        is: 'equal',
        not: 'notequal',
        after: 'greaterthan',
        onOrAfter: 'greaterthanorequal',
        before: 'lessthan',
        onOrBefore: 'lessthanorequal',
      };
      if (!filterModel.linkOperator) {
        filterModel.linkOperator = 'and';
      }
      const filters = filterModel.items.map((v) => this.getFilterForColumn(
        v.columnField,
        v.value,
        operatorMap[v.operatorValue] ?? v.operatorValue,
        true,
      ));
      where = this.addConditionOnFilters(
        filters,
        filterModel.linkOperator,
      );
    }
    if (!!pWhere && pWhere !== true) {
      where = Predicate.and([pWhere, ...(where ?? [])]);
    }
    if (initFilters) {
      where = Predicate.and([initFilters, ...(where ?? [])]);
    }
    return where;
  }

  getDefaultSearchFilters() {
    return true;
  }

  /* } search functions */

  /* handlers { */
  async onPageChange(page) {
    this.setPage(page);
    if (this.paginationCheck()) return;
    await this._search();
  }

  async onPageSizeChange(pageSize) {
    this.setPageSize(pageSize);
    if (this.paginationCheck()) return;
    this.resetGridRows();
    await this._search();
  }

  async onSortModelChange(sortModel) {
    this.setSortModel(sortModel);
    if (this.paginationCheck()) return;
    this.resetGridRows();
    await this._search();
  }

  async onFilterModelChange(filterModel) {
    if (filterModel.items) {
      filterModel.items.map((item) => {
        if (!item.value) {
          item.value = '';
        }
      });
    }
    this.setFilterModel(filterModel);
    if (!filterModel?.items?.every((item) => !!item.value)) {
      return;
    }

    if (this.paginationCheck()) return;
    this.resetGridRows();
    await this._search();
  }

  async onSelectionModelChange(selectionModel) {
    this.setSelectionModel(selectionModel);
    this.checkActionButtons(selectionModel);
    // localStorage.setItem(
    // 	`${this.props.code}_selectionModel`,
    // 	JSON.stringify(selectionModel)
    // );
  }
  async onTemplateSelectionModelChange(selectionModel) {
    this.dispatch({ type: 'SET_SELECTION', selectionModel });
    this.checkActionButtons(selectionModel);
  }

  checkActionButtons(selectionModel) {
    if (Array.isArray(selectionModel) && selectionModel.length > 0) {
      this.setShowActionButtons(true);
    } else {
      this.setShowActionButtons(false);
    }
  }
  async onRowsScrollEnd(params) {
    if (typeof this.rowCount === 'number' && this.rowCount > 0) { await this._search(); }
  }
  async onCellClick(params) {
    console.log('cellClicked', params);
  }

  paginationCheck() {
    return this.paginationMode === 0 || this.paginationMode === 1;
  }

  onSearchChange(event) {
    this.setSearch(event.target.value);
    this.resetGridRows();
    this._search();
  }

  previewQuery() {
    this.setShowQuery(true);
    const gridCode = this.props.code;
    if (gridCode) {
      const url = `${FE.urls.apiUrl}/core/gridBuilder/preview?gridCode=${gridCode}`;
      FE.http(url).then((response) => this.displayQuery(response.data))
        .catch((error) => console.log('Error', error));
    } else {
      // this.pageObj._controllerService.onError("Please save Grid first.");
      // return false;
    }
  }

  displayQuery(res) {
    this.setQueryData(res.data.queryString);
  }

  /* } handlers */

  /* JSX components { */

  ToolbarJSX({
    showActionButtons,
    showButtons,
    showToolbarMenus,
    showGlobalSearch,
    // to show search text input in toolbar
    search,
    onSearchChange,
  }) {
    // returns what to show in the toolbar section
    return (
      <GridToolbarContainer>
        {this.gridDef && (
          <Grid
            container
            sx={{
              direction: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1,
            }}
          >
            <Grid item>
              {showToolbarMenus?.all && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => { this.showFilterFlag = !this.showFilterFlag; this.setShowFilterFlag(this.showFilterFlag); }}>
                    {!this.showFilterFlag ? <SettingsIcon /> : <CloseIcon />}
                  </IconButton>
                  <Grid container sx={{ display: this.showFilterFlag ? 'flex' : 'none', direction: 'row' }}>
                    {showToolbarMenus?.export && (
                      <GridToolbarExport variant="outlined" sx={{ ml: '10px', mr: 1 }} />
                    )}
                    {showToolbarMenus?.columns && (
                      <GridToolbarColumnsButton variant="outlined" sx={{ mr: 1 }} />
                    )}
                    {showToolbarMenus?.filter && (
                      <GridToolbarFilterButton variant="outlined" sx={{ mr: 1 }} />
                    )}
                    {showToolbarMenus?.density && (
                      <GridToolbarDensitySelector variant="outlined" />
                    )}
                  </Grid>
                </Box>
              )}
            </Grid>
            <Grid item>
              <Grid container sx={{ direction: 'row' }}>
                {showActionButtons && this.ActionButtonsJSX()}
                {showButtons && this.ButtonsJSX()}
                {showGlobalSearch && (
                  <TextField
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Global search"
                    InputProps={{
                      startAdornment: <Icon>search</Icon>,
                    }}
                  />
                )}
                {
                  this.showDebuggerFlag ? (
                    <Button
                      sx={{
                        ml: 1, height: '32px', position: 'realtive', top: '3px',
                      }}
                      size="small"
                      variant="outlined"
                      onClick={() => this.previewQuery()}
                    >
                      Grid Query
                    </Button>
                  ) : null
                }
                {FE.getUserInformation().isDeveloper && (
                  <IconButton sx={{ ml: '5px' }} onClick={() => { this.showDebuggerFlag = !this.showDebuggerFlag; this.setShowDebuggerFlag(this.showDebuggerFlag); }}>
                    {!this.showDebuggerFlag ? <BugReportIcon /> : <CloseIcon />}
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Grid>
        )}
        {!this.gridDef && (
          <>
            <Skeleton
              animation="wave"
              height={30}
              width="20%"
              style={{ marginRight: 6 }}
            />
            <Skeleton
              animation="wave"
              height={30}
              width="20%"
              style={{ marginRight: 6 }}
            />
            <Skeleton
              animation="wave"
              height={30}
              width="20%"
              style={{ marginRight: 6 }}
            />
          </>
        )}
      </GridToolbarContainer>
    );
  }

  ActionButtonsJSX() {
    // return action buttons when rows selected
    return this.gridDef?.actionButtons?.map((button, i) => (
      <Tooltip
        placement="left"
        key={`actionButton_${button.label}_${i}`}
        title={button.label}
      >
        <Button
          variant="contained"
          size="small"
          sx={{
            height: '32px', position: 'relative', top: '3px', mr: '10px', boxShadow: 'none',
          }}
          onClick={(event) => this.handleActionButtonClick({
            event,
            functionName: button.function_name,
          })}
          startIcon={button.icon ? <Icon>{formatIcon(button.icon)}</Icon> : <Icon>add</Icon>}
        >
          {button.label}
        </Button>
      </Tooltip>
    ));
  }

  ButtonsJSX() {
    if (!this.gridDef?.buttons?.length) {
      return null;
    }

    return this.gridDef?.buttons?.map((button, i) => (
      <Tooltip key={`ButtonJs_${button.label}_${i}`} title={button.label}>
        <Button
          size="small"
          sx={{
            height: '32px', position: 'relative', top: '3px', mr: '10px', boxShadow: 'none',
          }}
          onClick={(event) => {
            this.handleButtonClick({
              event,
              functionName: button.function_name,
            });
          }}
          variant="contained"
          startIcon={button.icon ? <Icon>{formatIcon(button.icon)}</Icon> : <Icon>add</Icon>}
        >
          {button.label}
        </Button>
      </Tooltip>
    ));
  }

  actionBtnShowHide(action, params) {
    if (params.row.hasOwnProperty(`${action.prop}`)) {
      if (params.row[action.prop] !== 0) {
        return action;
      }
    } else {
      return action;
    }
  }

  RenderActionCellJSX({ params }) {
    const { gridDef } = this;
    return (
      <Grid container sx={{ direction: 'row' }} wrap="nowrap">
        {gridDef?.actions
          && gridDef?.actions.filter((action) => this.actionBtnShowHide(action, params))
            .filter((action) => action?.position === 1)
            .map((action, i) => (
              /* action button to be visible all the time */
              <Grid item key={`action_button${i}_${action?.prop}`}>
                <Tooltip title={action?.name} placement="left">
                  <IconButton
                    onClick={(event) => {
                      /* fires function added to helper in client files */
                      this.handleActionClick({
                        functionName: action?.function_name,
                        params,
                        event,
                      });
                    }}
                  >
                    {action?.icon ? <Icon>{formatIcon(action.icon)}</Icon> : <Icon>add</Icon>}
                  </IconButton>
                </Tooltip>
              </Grid>
            ))}
        {gridDef?.actions
          && gridDef?.actions.filter((action) => this.actionBtnShowHide(action, params))
            .filter((action) => action?.position !== 1)
            .length !== 0 && (
            // more button to be viewed when there are extra hidden buttons
            <Grid item>
              <PopupState
                variant="popover"
                popupId={`more_id_${params.id}`}
              >
                {(popupState) => (
                  // using popup library to maintain the popup state to display pther action buttons
                  <>
                    <Tooltip
                      placement="left"
                      title="More"
                      id={`Tooltip_${params.id}`}
                    >
                      <IconButton
                        id={`Buttons_${params.id}`}
                        {...bindTrigger(popupState)}
                      >
                        <Icon>more_vert</Icon>
                      </IconButton>
                    </Tooltip>
                    <Menu {...bindMenu(popupState)} sx={{ '& ul': { display: 'flex', flexDirection: 'column' } }}>
                      {gridDef.actions
                        .filter(
                          (action) => action.position !== 1,
                        )
                        .filter((action) => this.actionBtnShowHide(action, params)).map((action, i) => (
                          // extra action buttons inside menu
                          <>
                            {/* <Tooltip
                            placement="left"
                            key={`action_button_more_${i}_${action?.prop}`}
                            title={action?.name}
                          > */}
                            <Button
                              variant="outlined"
                              // startIcon={action?.icon ? <Icon>{formatIcon(action.icon)}</Icon> : <Icon>add</Icon>}
                              onClick={(
                                event,
                              ) => {
                                // fires function added to helper in client files
                                this.handleActionClick(
                                  {
                                    functionName: action?.function_name,
                                    params,
                                    event,
                                  },
                                );
                              }}
                            >
                              {action?.name}
                              {/* {action?.icon ? <Icon>{formatIcon(action.icon)}</Icon> : <Icon>add</Icon>} */}
                            </Button>
                            {/* </Tooltip> */}
                          </>
                        ))}
                    </Menu>
                  </>
                )}
              </PopupState>
            </Grid>
          )}
      </Grid>
    );
  }

  getPercentageBoxJSX({ label, width, color }) {
    // width percentage
    // get the percentage box with label
    // bucket fill
    const wrapStyle = {
      width: '100%',
      border: '1px solid grey',
      height: '26px',
      overflow: 'hidden',
      position: 'relative',
      borderRadius: '2px',
    };
    const backgroundStyle = {
      width: '100%',
      display: 'flex',
      position: 'absolute',
      lineHeight: '24px',
      justifyContent: 'center',
    };
    const percentageStyle = {
      maxWidth: `${width}%`,
      backgroundColor: color,
      height: '100%',
    };
    return (
      <div
        // @ts-ignore
        style={wrapStyle}
      >
        <div
          // @ts-ignore
          style={backgroundStyle}
        >
          {label}
        </div>
        <div style={percentageStyle} />
      </div>
    );
  }

  /* } JSX comoponents */

  /* click handlers { */
  handleActionButtonClick = ({ event, functionName }) => {
    const { selectionModel, rows } = this.stateRef.current;
    // fires funtion mentioned on the client helper
    (this[functionName] ?? this.defaultNoActionButtonFunction).bind(this)({
      event,
      rows,
      selectionModel,
      name: functionName,
      history: this.history,
    });
  };

  handleButtonClick({ event, functionName }) {
    const { selectionModel, rows } = this.stateRef.current;
    // fires funtion mentioned on the client helper
    (this[functionName] ?? this.defaultNoButtonFunction).bind(this)({
      event,
      rows,
      selectionModel,
      name: functionName,
      history: this.history,

    });
  }

  handleActionClick({ functionName, params, event }) {
    // fires funtion mentioned on the client helper
    (this[functionName] ?? this.defaultNoActionFunction).bind(this)({
      event,
      ...params,
      name: functionName,
      history: this.history,
    });
  }

  defaultNoButtonFunction({ event, name }) {
    console.log('Button function not found : ', name);
  }

  defaultNoActionButtonFunction({ event, name }) {
    console.log('Action Button function not found : ', name);
  }

  defaultNoActionFunction({ event, name }) {
    console.log('Action function not found : ', name);
  }
  /* } click handlers */

  /* constants { */
  columnType = {
    1: ({ column, helper }) => {
      // string
      const meta = column?.meta;
      let metaFnx;
      try {
        eval(`metaFnx = function(value,column) {${meta}}`);
      } catch (e) { }
      return {
        type: 'string',
        renderCell: (params) => {
          const { value } = params;
          const config = metaFnx?.(value, column);

          return (
            <Tooltip title={params.value || '-'} arrow sx={{ maxWidth: '300px' }}>
              <Typography sx={{ fontSize: '0.92rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {`${config?.prefix ?? ''}${value || '-'}${config?.suffix ?? ''
                  }`}
              </Typography>
            </Tooltip>
          );
        },
      };
    },
    2: ({ column, helper }) => {
      // number
      const meta = column?.meta;
      let metaFnx;
      try {
        eval(`metaFnx = function(value,column) {${meta}}`);
      } catch (error) { }
      return {
        type: 'number',
        renderCell: (params) => {
          const { value } = params;
          const config = metaFnx?.(value, column);
          return `${config?.prefix ?? ''}${value}${config?.suffix ?? ''
            }`;
        },
      };
    },
    3: ({ column, helper }) =>
    // let meta = column?.meta;
    // date
    ({
      type: 'date',
      renderCell: (params) => {
        const { value } = params;
        // const date = format(new Date(value), meta ?? "d-LLL-yyyy");
        // todo need to check the signifcace of meta is there or not and also need to move this data to some dedicated date formating
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(value);
        const formatted_date = value ? FEDate.toDMonY(date) : '-';
        return formatted_date;
      },
    }),
    4: ({ column, helper }) => {
      const meta = column?.meta;
      // dataTime
      return {
        type: 'dateTime',
        valueFormatter: (params) => {
          const { value } = params;
          const date = format(
            new Date(value),
            meta ?? 'd-LLL-yyyy h:mm bbb',
          );
          return date;
        },
      };
    },
    5: ({ column, helper }) =>
    // boolean
    ({
      type: 'boolean',
      renderCell: (params) => (
        <span>
          {params.value == (true || 1) ? 'Yes' : ''}
          {' '}
          {params.value == (false || 0) ? 'No' : ''}
        </span>
      ),
    }),
    6: ({ column, helper }) => {
      // chip
      const meta = column?.meta;
      let metaFnx;
      try {
        eval(`metaFnx = function(value,column) {${meta}}`);
      } catch (error) { }
      return {
        type: 'string',
        renderCell: (params) => {
          const { value } = params;
          const config = metaFnx?.(value, column);
          return (
            <Chip
              variant="outlined"
              size="small"
              style={{
                color: config?.color,
                borderColor: config?.color,
              }}
              label={value}
              icon={config?.icon ? <Icon>{formatIcon(config.icon)}</Icon> : <Icon>add</Icon>}
            />
          );
        },
      };
    },
    7: ({ column, helper }) => {
      // percentage
      const meta = column?.meta;
      let metaFnx;
      try {
        eval(`metaFnx = function(value,column) {${meta}}`);
      } catch (error) { }
      return {
        type: 'number',
        renderCell: (params) => {
          const { value } = params;
          const config = metaFnx?.(value, column);
          const label = `${value} %`;
          const width = config?.width ?? value;
          const color = config?.color ?? 'green';

          return helper.getPercentageBoxJSX({
            label,
            width,
            color,
          });
        },
      };
    },
    8: ({ column, helper }) => {
      // fraction
      const meta = column?.meta;
      let metaFnx;
      try {
        eval(`metaFnx = function(value,column) {${meta}}`);
      } catch (error) { }
      return {
        type: 'string',
        renderCell: (params) => {
          const { value } = params;
          const config = metaFnx?.(value, column);
          const fr = value.split('/');
          const perc = ((+fr?.[0] ?? 1) / (+fr?.[1] ?? 2)) * 100;
          const label = value;
          const color = config?.color ?? 'green';
          const width = config?.width ?? perc;
          return helper.getPercentageBoxJSX({
            label,
            width,
            color,
          });
        },
      };
    },
    9: ({ column, helper }) =>
    // rating stars
    ({
      type: 'number',
      renderCell: (params) => {
        const { value } = params;
        return (
          <Grid container sx={{ direction: 'row' }} wrap="nowrap">
            <Rating
              readOnly
              value={value}
              precision={0.25}
              size="small"
              max={5}
            />
            <Typography>{value}</Typography>
          </Grid>
        );
      },
    }),
    10: ({ column, helper }) =>
    // avatar
    ({
      type: 'string',
      filterable: false,
      renderCell: (params) => {
        const { value } = params;
        return <Avatar alt={value} src={value} />;
      },
    }),
    12: ({ column, helper }) =>
    // status
    ({
      type: 'string',
      filterable: false,
      renderCell: (params) => {
        const valueSplit = (params?.value || '').split('###');
        const value = valueSplit[0];
        const color = valueSplit[1];

        if (!color) {
          const meta = column?.meta;
          let metaFnx;
          let config;
          try {
            eval(`metaFnx = function(value,column) {${meta}}`);
            config = metaFnx?.(value, column);
          } catch (e) { }
          return (
            <Typography sx={{ fontSize: '0.92rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {`${config?.prefix ?? ''}${value || '-'}${config?.suffix ?? ''}`}
            </Typography>
          );
        }

        return (
          <Label
            sx={{ fontSize: '0.82rem' }}
            variant="soft"
            color={color}
          >
            {value}
          </Label>
        );
      },
    }),
  };
  /* } constants */

  /* columns definataion functions */

  getEachColumnDef({ column }) {
    // get ColumnDef for each column
    const helper = this;
    return {
      // the default properties for each datagrid column
      field: column.prop,
      headerName: column.name,
      align: column.align,
      width: column.width,
      description: column.name,
      sortable: column.sortable === 1,
      disableColumnMenu: column.filterable !== 1,
      filterable: column.filterable === 1,
      resizable: column.resizable === 1,
      // datatype based properties
      renderCell: (params) => (
        <Tooltip title={params.value} arrow sx={{ maxWidth: '300px' }}>
          <Typography sx={{ fontSize: '0.92rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
      ...this.columnType[column.uiType]?.({
        column,
        helper,
      }),
    };
  }

  getTemplatedColumnDef() {
    // for template based grid
    const Template = this?.constructor?.template;
    if (!Template) return [];
    const cols = [
      {
        field: 'template',
        description: 'Template',
        sortable: false,
        width: 600,
        disableColumnMenu: true,
        renderCell: (params) => Template({ ...params.row, helper: this }) // pass all the row data to the Template
        ,
      },
    ];
    return cols;
  }

  getActionsColumnDef() {
    // ActionButton Column Header
    // used to fire funtion on single row
    return {
      field: 'action',
      headerName: 'Actions',
      description: 'Actions',
      sortable: false,
      filterable: false,
      width: 200,
      disableColumnMenu: true,
      cellClassName: 'action-cell',
      renderCell: (params) => this?.RenderActionCellJSX({ params }),
    };
  }

  /* columns defination functions */

  get listUrl() {
    try {
      let cProps = this.props?.getPage();
      if (cProps.isController !== true) {
        cProps = this.props?.getPage().controller;
      }

      // @ts-ignore
      const url = `${FE.urls.apiUrl}/${cProps.moduleName}/${cProps.controllerName}/list`;
      return url;
    } catch (e) {
      console.log('%c Cannot form Link => giving default link', 'background: #FF0033;', e);
      return `${FE.urls.apiUrl}/core/formBuilder/list`;
    }
  }

  addNew({ history }) {
    const routeProps = this.getItemRoute('newPath');
    const navigateURL = this.getActualNavigateURL(routeProps);
    history(navigateURL[0], navigateURL[1]);
  }

  edit(args) {
    const routeProps = this.getItemRoute('editPath');
    const navigateURL = this.getActualNavigateURL(routeProps, args);
    args.history(navigateURL[0], navigateURL[1]);
  }

  getItemRoute(path) {
    const page = this.props.getPage();
    if (page.controller?.routeMapping?.[page.code]) {
      return page.controller.routeMapping[page.code].items[this.refCode][path];
    }
  }

  getPathEndRoute(pageRouteProps, route, args) {
    const action = pageRouteProps.action_mapping[route];
    const key = action.url.split(':')[1];
    const endRoute = args.row[key];
    return [key, { [key]: endRoute }];
  }

  getActualNavigateURL(routeProps, args = {}) {
    const pageRouteProps = this.props.getPage().controller.routeMapping[routeProps.page];
    const controllerURL = this.props.getPage().controller.routeMapping[this.props.getPage().controller.code].url;
    const role = this.location.pathname.split('/')[1];

    let navigateURL = `/${pageRouteProps.url}`;

    if (this.props.getPage().controller.isComposite) {
      navigateURL = `/${controllerURL}/${pageRouteProps.url.split('/')[1]}`;
    }

    if (window.location.pathname.split('/')[2] !== controllerURL) {
      navigateURL = `/${window.location.pathname.split('/')[2]}/${pageRouteProps.url}`;
    }

    let pathEndRoute = ['', ''];
    if (routeProps.route) {
      pathEndRoute = this.getPathEndRoute(pageRouteProps, routeProps.route, args);
      navigateURL += `/:${pathEndRoute[0]}`;
    }

    navigateURL = `/${role}${navigateURL}`;
    return [navigateURL, pathEndRoute[1]];
  }

  /**
   * @description
   * Function to get array of selected row(s) data.
   * apiRef.getSelectedRows() returns a map object, converting that map object into array of
   * all the selected row(s) data.
   *
   * @author Nikhil Kumar
   */
  getSelectedRows() {
    try {
      let selectedRows = [];
      if (this.apiRef && this.apiRef.current && this.apiRef.current.getSelectedRows) {
        for (const [key, value] of this.apiRef.current.getSelectedRows().entries()) {
          selectedRows.push(value);
        }
      } else {
        selectedRows = this.getTemplateSelectionModel();
      }
      return selectedRows;
    } catch (e) {
      console.log(e);
      this.displayToast('Error getting selected rows data.', 'error');
    }
  }

  getSelectedRowsIds({ idFlexilabel = 'id', includeNull = true }) {
    try {
      let selectedRows = [];
      if (this.apiRef && this.apiRef.current && this.apiRef.current.getSelectedRows) {
        for (const [key, value] of this.apiRef.current.getSelectedRows().entries()) {
          if (!value[idFlexilabel] && includeNull !== true) {
            continue;
          }
          selectedRows.push(value[idFlexilabel]);
        }
      } else {
        selectedRows = this.getTemplateSelectionModel();
      }
      return selectedRows;
    } catch (e) {
      console.log(e);
      this.displayToast('Error getting selected rows data.', 'error');
    }
  }

  encryptString(value) {
    const wordArray = Crypto.enc.Utf8.parse(value);
    const base64 = Crypto.enc.Base64.stringify(wordArray);
    return `_${base64}_`;
  }

  decryptString(str) {
    const parsedWordArray = Crypto.enc.Base64.parse(str);
    const parsedStr = parsedWordArray.toString(Crypto.enc.Utf8);
    return parsedStr;
  }

  createQueryParams(data) {
    let params = '?';
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (i !== (keys.length - 1)) {
        params += `${keys[i]}=${data[keys[i]]}&`;
      } else {
        params += `${keys[i]}=${data[keys[i]]}`;
      }
    }
    return params;
  }
}

// #region Exports
export { DefaultGridHelper };
DefaultGrid.Helper = DefaultGridHelper;
export default DefaultGrid;
// #endregion Exports
