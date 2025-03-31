import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const ReactResponsiveTable = ({ columns, data, serialize = false, initialCount = 0 }) => {
  return columns && Array.isArray(columns) && columns.length > 0 ? (
    <Table>
      <Thead>
        <Tr>
          {serialize && <Th>S.No</Th>}
          {columns.map((item, index) => (
            <Th key={`column${index}`}>{item.title}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data && Array.isArray(data) && data.map((item, index) => (
          <Tr key={`data${index}`}>
            {serialize && <Td>{index + Number(initialCount) + 1}</Td>}
            {columns.map((col, colInd) => (
              <Td key={`data${index}${colInd}`}>
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
