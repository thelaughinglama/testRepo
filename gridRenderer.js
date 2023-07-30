import React, {
  useEffect, useState, useReducer, useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

/* MUI imports */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Icon from '@mui/material/Icon';
import Menu from '@mui/material/Menu';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DataGridPro, useGridApiRef } from '@mui/x-data-grid-pro';

/* System imports */
import ShowFeSkeleton from '@Lib/loaders/feSkeleton';
import useResponsive from '@Lib/srcMinimal/hooks/useResponsive';
import { useSettingsContext } from '@Lib/srcMinimal/components/settings';
import useFeNavigate from '@Lib/customHooks/useFeNavigate';
import useDisplayToast from '@Lib/sharedServices/displayToast.js';

import useFeCache from '@Lib/customHooks/useFeCache';

// import useStyles from './styles';

const generateId = () => {
  const d = typeof performance === 'undefined'
    ? Date.now()
    : performance.now() * 1000;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + d) % 16 | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); // == or === ??
  });
};

const style = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

let loaderCheck = false;

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

function GridRenderer(props) {
  const isMobile = useResponsive('down', 'sm');
  const { themeStretch } = useSettingsContext();
  // const classes = useStyles();
  const history = useFeNavigate();
  const location = useLocation();
  const cache = useFeCache();
  const apiRef = useGridApiRef();
  const displayToast = useDisplayToast();
  const actionDispatcher = useDispatch();
  const { helper } = props;
  const [state, dispatch] = useReducer(
    helper.stateReducers.bind(helper),
    helper.initialStates,
  );
  const stateRef = useRef(state);

  useEffect(() => {
    helper.assignStateController({ dispatch, stateRef });
    helper.assingApiRef(apiRef);
    helper.assignDisplayToast(displayToast);
    helper.assignCache(cache);
    helper.assignActionDispatcher(actionDispatcher);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!history) return;
    helper.assignLocation(location);
    helper.assignHistory(history);
    helper.assignTemplateSelection(getTemplateSelectionModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    helper.initGrid(props.initProps);
  }, []);

  const [columns, gridDef] = [state.columns, state.gridDef];
  const [rows = []] = [state.rows];
  const [rowCount] = [state.rowCount];
  const [rowHeight, paginationMode, rowsPerPageOptions] = [
    state.rowHeight,
    state.paginationMode,
    state.rowsPerPageOptions,
  ];
  const [sortModel] = [state.sortModel];
  const [selectionModel] = [state.selectionModel];
  const [filterModel] = [state.filterModel];
  const [page] = [state.page];
  const [pageSize] = [state.pageSize];
  const [search] = [state.search];
  const [loadingRows, loadingColumns] = [
    state.loadingRows,
    state.loadingColumns,
  ];
  const [showActionButtons, showButtons] = [
    state.showActionButtons,
    state.showButtons,
  ];
  const [showToolbarMenus, showGlobalSearch] = [
    state.showToolbarMenus,
    state.showGlobalSearch,
  ];

  const Toolbar = helper.ToolbarJSX.bind(helper); 
  useEffect(() => {
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].__id) {
        rows[i].__id = generateId();
      }
    }
  }, [rows]);

  useEffect(() => {
    if (state.loadingRows) {
      loaderCheck = true;
    }
    if (loaderCheck && !state.loadingRows) {
      setIsVisible(true);
      setHideOverlay(true);
    }
  }, [state.loadingRows]);

  const onSearchChange = (event) => {
    helper.onSearchChange(event);
  };

  const onPageChange = (page) => {
    helper.onPageChange(page);
  };

  const onCellClick = (params) => {
    helper.onCellClick(params);
  };

  const onPageSizeChange = (pageSize) => {
    helper.onPageSizeChange(pageSize);
  };

  const onSortModelChange = (sortModel) => {
    helper.onSortModelChange(sortModel);
  };

  const onFilterModelChange = (filterModel) => {
    helper.onFilterModelChange(filterModel);
  };
  const onSelectionModelChange = (selectionModel) => {
    helper.onSelectionModelChange(selectionModel);
  };

  const onRowsScrollEnd = (params) => {
    helper.onRowsScrollEnd(params);
  };

  columns?.map((column) => {
    column.headerClassName = 'super-app-theme--header';
    if (column.field !== 'action') {
      column.cellClassName = 'super-app-theme--cell';
    }
    return column;
  });

  function handleActionClick({ functionName, params, event }) {
    (helper[functionName] ?? helper.defaultNoActionFunction).bind(
      helper,
    )({
      event,
      ...params,
      name: functionName,
      history: helper.history,
    });
  }

  function RenderActionCellJSX({ params }) {
    return (
      <Grid container sx={{ direction: 'row' }} wrap="nowrap">
        {gridDef?.actions
          && gridDef?.actions
            .filter((action) => action?.position === 1)
            .map((action, i) => (
              <Grid
                item
                key={`action_button${i}_${action?.prop}`}
              >
                <Tooltip placement="left" title={action?.name}>
                  <IconButton
                    sx={(theme) => ({
                      color: theme.palette.primary.main,
                    })}
                    onClick={(event) => {
                      handleActionClick({
                        functionName:
                          action?.function_name,
                        params,
                        event,
                      });
                    }}
                  >
                    {action?.icon ? (
                      <Icon>
                        {formatIcon(action.icon)}
                      </Icon>
                    ) : (
                      <Icon>add</Icon>
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
            ))}
        {gridDef?.actions
          && gridDef?.actions?.filter((action) => action?.position !== 1)
            .length !== 0 && (
            <Grid item>
              <PopupState
                variant="popover"
                popupId={`more_id_${params.id}`}
              >
                {(popupState) => (
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
                    <Menu {...bindMenu(popupState)}>
                      {gridDef.actions
                        .filter(
                          (action) => action.position !== 1,
                        )
                        .map((action, i) => (
                          <Tooltip
                            placement="left"
                            key={`action_button_more_${i}_${action?.prop}`}
                            title={action?.name}
                          >
                            <IconButton
                              onClick={(
                                event,
                              ) => {
                                handleActionClick(
                                  {
                                    functionName:
                                      action?.function_name,
                                    params,
                                    event,
                                  },
                                );
                              }}
                            >
                              {action?.icon ? (
                                <Icon>
                                  {formatIcon(
                                    action.icon,
                                  )}
                                </Icon>
                              ) : (
                                <Icon>add</Icon>
                              )}
                            </IconButton>
                          </Tooltip>
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
  const colorMap = {
    'badge-danger': 'error',
  };
  function RenderActionsJSX({ params, fullHeight }) {
    return (
      <Grid container sx={{ direction: 'row' }} wrap="nowrap">
        {gridDef?.actions
          && gridDef?.actions
            .map((action, i) => (params.row[action.prop] !== 0 ? (
              <Grid
                item
                key={`action_button${i}_${action?.prop}`}
              >
                <Stack
                  direction="row"
                  spacing={action.length}
                  sx={{ '& button': { m: 1 }, ...(fullHeight ? { height: '100%' } : {}) }}
                  title={action.name}
                >
                  <Button
                    variant="contained"
                    color={colorMap[action.theme] || 'primary'}
                  
                    onClick={(event) => {
                      handleActionClick({
                        functionName:
                          action?.function_name,
                        params,
                        event,
                      });
                    }}
                  >
                    {action.name}
                  </Button>
                </Stack>
              </Grid>
            ) : null))}
      </Grid>
    );
  }

  function GridCardView() {
    if (columns && columns.length) {
      const columnsMap = {};
      columns.map((column) => {
        columnsMap[column.field] = column.headerName;
      });
      return rows.length ? (
        rows.map((row) => (
          <Card sx={{ p: 2, mb: 2 }}>
            {Object.keys(row).map((key) => {
              if (columnsMap[key]) {
                return (
                  <Grid container sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography>
                        <strong>
                          {columnsMap[key]}
                          :
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>
                        {row[key]}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              }
            })}
            <Grid container>
              <Grid
                item
                xs={4}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography>
                  <strong>Actions:</strong>
                </Typography>
              </Grid>
              <Grid item xs={8} sx={{ ml: -1 }}>
                <RenderActionCellJSX
                  params={{ id: row.id || row.__id, row }}
                />
              </Grid>
            </Grid>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container>
            <Grid item xs={12}>
              <Typography>No data.</Typography>
            </Grid>
          </Grid>
        </Card>
      );
    }
    return null;
  }
  const [templateSelectionModel, setTemplateSelectionModel] = useState([]);

  function getTemplateSelectionModel() {
    return templateSelectionModel;
  }

  function handleClick(rowId) {
    if (!templateSelectionModel.includes(rowId)) {
      const updatedArray = [...templateSelectionModel, rowId];
      setTemplateSelectionModel(updatedArray);
      return onTemplateSelectionModelChange(updatedArray);
    }
    const index = templateSelectionModel.indexOf(rowId);
    setTemplateSelectionModel((old) => [
      ...old.slice(index + 1),
      ...old.slice(0, index),
    ]);
  }

  const onTemplateSelectionModelChange = (selectionModel) => {
    helper.onTemplateSelectionModelChange(selectionModel);
  };
  function GridTemplateView() {
    if (columns && columns.length) {
      const columnsMap = {};
      columns.map((column) => {
        columnsMap[column.field] = column.headerName;
      });

      return rows.length ? (
        <Grid container rowSpacing={2} columnSpacing={3}>
          {rows.map((row) => (
            <Grid item xs={12} sm={props.initProps?.templateCol || 12}>
              <Grid container>
                <Grid item key={row.id} xs={gridDef.selection === 1 ? 0.5 : 0} sx={{ mt: 3 }}>
                  {gridDef.selection === 1 ? (
                    <Checkbox
                      checked={templateSelectionModel.includes(
                        row.id,
                      )}
                      onChange={() => handleClick(row.id)}
                      inputProps={{
                        'aria-label': 'controlled',
                      }}
                    />
                  ) : null}
                </Grid>

                <Grid item xs={gridDef.selection === 1 ? 11.5 : 12}>
                  <Card sx={{ p: 1, mb: 1 }}>
                    {React.createElement(
                      props.initProps.template,
                      { ...row, helper },
                    )}

                    <Grid container>
                      <Grid item xs={12} sx={{ ml: 2, mt: 2 }}>
                        <RenderActionsJSX
                          fullHeight
                          params={{
                            id: row.id || row.__id,
                            row,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container>
            <Grid item xs={12}>
              <Typography>No data.</Typography>
            </Grid>
          </Grid>
        </Card>
      );
    }

    return null;
  }

  const paginationModeOptions = {
    0: {
    },
    1: {
      pagination: true,
      paginationMode: 'client',
      onPageChange,
      page,
      pageSize,
      rowsPerPageOptions,
      onPageSizeChange,
    },
    2: {
      pagination: true,
      paginationMode: 'client',
      sortingMode: 'server',
      filterMode: 'server',
      onPageChange,
      pageSize,
      rowsPerPageOptions,
      onPageSizeChange,
      page,
      // onRowsScrollEnd: undefined,
    },
    3: {
      onRowsScrollEnd,
      scrollEndThreshold: 200,
    },
  };

  let options = {
    apiRef,
    components: {
      Toolbar,
    },
    componentsProps: {
      toolbar: {
        showActionButtons,
        showButtons,
        showToolbarMenus,
        showGlobalSearch,
        search,
        onSearchChange,
      },
    },
    onCellClick,
    rowCount, 
    onSortModelChange,
    sortModel,
    onFilterModelChange,
    filterModel,
    onSelectionModelChange,
    selectionModel,
    checkboxSelection: gridDef?.selection === 1, 
    disableSelectionOnClick: true, 
    rows,
    columns,
    getRowId: (row) => {
      if (!row.__id) {
        row.__id = generateId();
      }
      return row.__id;
    },
    density: 'comfortable',
  };

  const noOptions = {
    components: { Toolbar },
    componentsProps: {
      showActionButtons,
      showButtons,
      showToolbarMenus,
    },
    columns: [{ field: 'Loading ...', width: 600 }],
    rows: [],
    loading: true,
  };

  options = {
    ...options,
    ...paginationModeOptions[!isMobile ? paginationMode : 0],
  };

  const breakCount = [];
  const licenseClear = [];
  try {
    const elem = document.getElementsByClassName('MuiDataGrid-main');
    for (let i = 0; i < elem?.length; i += 1) {
      licenseClear[i] = setInterval(() => {
        const elem = document.getElementsByClassName('MuiDataGrid-main');
        if (!elem[i]) {
          console.log(`Element at index ${i} does not exist, skipping.`);
          return;
        }
        breakCount[i] += 1;
        const licenseDiv = elem[i].children[elem[i].children.length - 2];
        licenseDiv.style.display = 'none';
        if (elem[i].children.length === 4) {
          clearInterval(licenseClear[i]);
        } else if (breakCount[i] > 10) {
          clearInterval(licenseClear[i]);
        }
      }, 300);
    }
  } catch (e) { }

  const [isVisible, setIsVisible] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);

  const onSelectAll = () => {
    if (templateSelectionModel.length !== rows.length) {
      const selected = [];
      for (const row of rows) {
        selected.push(row.id);
      }
      setTemplateSelectionModel([...selected]);
      onTemplateSelectionModelChange([...selected]);
    } else {
      setTemplateSelectionModel([]);
      onTemplateSelectionModelChange([]);
    }
  };

  return !hideOverlay ? (
    <ShowFeSkeleton {...props} hideOnClose />
  ) : (
    <>
      <Grid container direction="column">
        <Grid
          item
          sx={{
            mt: 1,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {props.initProps.template
              && gridDef.selection === 1 ? (
              <Checkbox
                checked={
                  templateSelectionModel.length
                  && templateSelectionModel.length
                  === rows.length
                }
                onChange={() => onSelectAll()}
              />
            ) : null}
            <Typography
              variant="h4"
              sx={{ mb: 0 }}
              gutterBottom
            >
              {gridDef?.label || ''}
            </Typography>
          </Box>
          <div>
            {templateSelectionModel.length > 0
              ? showActionButtons && helper.ActionButtonsJSX()
              : null}
          </div>
        </Grid>
        <Grid item>
          {!props.initProps.template ? (
            !isMobile ? (
              <Card sx={{ px: 2, pt: 1 }}>
                {columns && columns.length > 0 ? (
                  <Box
                    sx={{
                      width: '100%',
                      height:
                        props.height
                        || (!isMobile
                          ? '83vh'
                          : '70vh'),
                    }}
                  // className={classes.root}
                  >
                    <DataGridPro {...options} hideFooterRowCount={!!props.initProps?.hideFooterRowCount} hideFooterPagination={!!props.initProps?.hideFooterPagination} />
                    ;
                  </Box>
                ) : null}
              </Card>
            ) : (
              <GridCardView />
            )
          ) : (
            <GridTemplateView />
          )}
        </Grid>
      </Grid>
      <Modal open={props.showQuery} onClose={props.closeQueryModal}>
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            {props.gridCode}
            {' '}
            Query
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {props.queryData ? (
              props.queryData
            ) : (
              <ShowFeSkeleton {...props} hideOnClose />
            )}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}

export default GridRenderer;
