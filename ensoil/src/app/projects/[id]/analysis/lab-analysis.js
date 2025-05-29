'use client';

import React from 'react';
import labData from '@/data/simulatedLabData.json';
import * as XLSX from 'xlsx';

export default function LabAnalysisTable() {
  const { soil, water } = labData;

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Soil sheet
    const soilData = [
      ["Punto", "Muestra", "Metales", "pH/CE", "Gran.", "COT", "SPLP", "ABA", "Cr VI", "TTRR/Rh"],
      ...soil.map(row => [
        row.point,
        row.sample,
        row.metales ? 'X' : '',
        row.phce ? 'X' : '',
        row.gran ? 'X' : '',
        row.cot ? 'X' : '',
        row.splp ? 'X' : '',
        row.aba ? 'X' : '',
        row.crvi ? 'X' : '',
        row.ttrr ? 'X' : ''
      ])
    ];
    const soilSheet = XLSX.utils.aoa_to_sheet(soilData);
    XLSX.utils.book_append_sheet(wb, soilSheet, 'Suelo');

    // Water sheet
    const waterData = [
      ["Muestra", "Código", "Metales", "pH/CE", "Pb", "Iones", "Coliformes fecales", "Alcalinidad", "Amoníaco y amonio"],
      ...water.map(row => [
        row.sample,
        row.code,
        row.metales ? 'X' : '',
        row.phce ? 'X' : '',
        row.pb ? 'X' : '',
        row.iones ? 'X' : '',
        row.coliformes ? 'X' : '',
        row.alcalinidad ? 'X' : '',
        row.amoniaco ? 'X' : ''
      ])
    ];
    const waterSheet = XLSX.utils.aoa_to_sheet(waterData);
    XLSX.utils.book_append_sheet(wb, waterSheet, 'Agua');

    XLSX.writeFile(wb, 'LabAnalysis.xlsx');
  };

  return (
    <div className="analysis-table-container">
      <div>
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Punto</th>
              <th>Muestra</th>
              <th>Metales</th>
              <th>pH/CE</th>
              <th>Gran.</th>
              <th>COT</th>
              <th>SPLP</th>
              <th>ABA</th>
              <th>Cr VI</th>
              <th>TTRR/Rh</th>
            </tr>
          </thead>
          <tbody>
            {soil.map((row, i) => (
              <tr key={i}>
                <td>{row.point}</td>
                <td>{row.sample}</td>
                <td>{row.metales ? 'X' : ''}</td>
                <td>{row.phce ? 'X' : ''}</td>
                <td>{row.gran ? 'X' : ''}</td>
                <td>{row.cot ? 'X' : ''}</td>
                <td>{row.splp ? 'X' : ''}</td>
                <td>{row.aba ? 'X' : ''}</td>
                <td>{row.crvi ? 'X' : ''}</td>
                <td>{row.ttrr ? 'X' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
      <div>
        <h3 className="text-white text-xl font-semibold mb-4">Tabla: Análisis de Laboratorio - Agua</h3>
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Muestra</th>
              <th>Código</th>
              <th>Metales</th>
              <th>pH/CE</th>
              <th>Pb</th>
              <th>Iones</th>
              <th>Coliformes fecales</th>
              <th>Alcalinidad</th>
              <th>Amoníaco y amonio</th>
            </tr>
          </thead>
          <tbody>
            {water.map((row, i) => (
              <tr key={i}>
                <td>{row.sample}</td>
                <td>{row.code}</td>
                <td>{row.metales ? 'X' : ''}</td>
                <td>{row.phce ? 'X' : ''}</td>
                <td>{row.pb ? 'X' : ''}</td>
                <td>{row.iones ? 'X' : ''}</td>
                <td>{row.coliformes ? 'X' : ''}</td>
                <td>{row.alcalinidad ? 'X' : ''}</td>
                <td>{row.amoniaco ? 'X' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      */}
    </div>
  );
}