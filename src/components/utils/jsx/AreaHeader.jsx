import React from 'react';
import { Button } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

const AreaHeader = ({ title, onImportClick, onExportClick, onAddClick, onGetdataClick, ImportComponent, hideAddButton, disableImport, disableExport, disableGetdata, disableAdd }) => {
    return (
        <div className="area-header">
            <h2 className="custom-title">{title}</h2>
            <div className="button-level1">
                {onImportClick && (
                    <Button icon={<ImportOutlined />} onClick={onImportClick} disabled={disableImport}>
                        Nhập File
                    </Button>
                )}
                {onExportClick && (
                    <Button icon={<ExportOutlined />} onClick={onExportClick} disabled={disableExport}>
                        Xuất File
                    </Button>
                )}
                {onGetdataClick && (
                    <Button icon={<DownloadOutlined />} onClick={onGetdataClick} disabled={disableGetdata}> 
                        Lấy dữ liệu
                    </Button>
                )}
                {!hideAddButton && onAddClick && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick} disabled={disableAdd}>
                        Thêm mới
                    </Button>
                )}
            </div>
            {ImportComponent}
        </div>
    );
};

export default AreaHeader;
