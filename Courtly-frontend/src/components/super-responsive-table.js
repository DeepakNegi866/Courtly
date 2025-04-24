import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const ReactResponsiveTable = ({ columns, data, serialize = false, initialCount = 0, className = "" }) => {
  return columns && Array.isArray(columns) && columns.length > 0 ? (
    <Table className={`tabledata ${className}`}>
      <Thead>
        <Tr>
          {serialize && <Th className='table-header'>S.No</Th>}
          {columns.map((item, index) => (
            <Th className='table-header' key={`column${index}`}>
              {item.renderTh ? item.renderTh() : item.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data && Array.isArray(data) && data.map((item, index) => (
          <Tr key={`data${index}`}>
            {serialize && <Td className="table-cell">{index + Number(initialCount) + 1}</Td>}
            {columns.map((col, colInd) => (
              <Td className="table-cell" key={`data${index}${colInd}`}>
                {col.render ? col.render(item[col.key], item, index) : item[col.key]}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : null;
};

export default ReactResponsiveTable;
