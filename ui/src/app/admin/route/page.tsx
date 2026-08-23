"use client";

import { useRouteOptimization } from "./hooks/useRouteOptimization";
import { RouteForm } from "./components/RouteForm";
import { OptimizationResults } from "./components/OptimizationResults";

export default function Page() {
  const {
    form,
    setForm,
    errors,
    loading,
    results,
    errorMsg,
    totalDemand,
    invoices,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    handleAddDestination,
    handleAddDestinationFromInvoice,
    handleRemoveDestination,
    handleReset,
    handleSubmit,
  } = useRouteOptimization();

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            Route Optimization
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your fleet and delivery destinations below to calculate the most efficient routes.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <RouteForm
            form={form}
            setForm={setForm}
            errors={errors}
            loading={loading}
            errorMsg={errorMsg}
            totalDemand={totalDemand}
            invoices={invoices}
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            setSelectedWarehouseId={setSelectedWarehouseId}
            handleAddDestination={handleAddDestination}
            handleAddDestinationFromInvoice={handleAddDestinationFromInvoice}
            handleRemoveDestination={handleRemoveDestination}
            handleReset={handleReset}
            handleSubmit={handleSubmit}
          />
          
          <OptimizationResults 
            loading={loading}
            results={results}
          />
        </div>
      </div>
    </div>
  );
}
