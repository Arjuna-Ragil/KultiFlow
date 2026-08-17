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
    handleAddDestination,
    handleRemoveDestination,
    handleReset,
    handleSubmit,
  } = useRouteOptimization();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#71C168]">Routing Optimization</h1>
        <p className="mt-2 text-sm text-gray-500">Configure your fleet and delivery destinations below to calculate the most efficient routes.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <RouteForm
          form={form}
          setForm={setForm}
          errors={errors}
          loading={loading}
          errorMsg={errorMsg}
          totalDemand={totalDemand}
          handleAddDestination={handleAddDestination}
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
  );
}