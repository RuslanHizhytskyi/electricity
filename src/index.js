/**
 * This class is just a facade for your implementation, the tests below are using the `World` class only.
 * Feel free to add the data and behavior, but don't change the public interface.
 */


export class World {
  constructor() {
    this.powerPlants = new Set();
    this.households = new Set();
  }

  createPowerPlant() {
    const newPowerPlan = {
      alive: true,
      id: this.uniqueId(),
      connections: new Set(),
    };
    this.powerPlants.add(newPowerPlan);
    return newPowerPlan;
  }

  createHousehold() {
    const household = {
      id: this.uniqueId(),
      connectionsPowerPlan: new Set(),
      connectionsHousehold: new Set(),
      connectionsWithElectricity: new Set(),
    };
    this.households.add(household);
    return household;
  }

  connectHouseholdToPowerPlant(household, powerPlant) {
    if (!this.households.has(household) || !this.powerPlants.has(powerPlant)) {
      throw new Error("Invalid Household or PowerPlant");
    }

    household.connectionsPowerPlan.add(powerPlant.id);
    powerPlant.connections.add(household.id);
    if (powerPlant.alive) {
      if (!this.householdHasElectricity(household)) {
        household.connectionsWithElectricity.add(powerPlant.id);
        this.householdUpdateElectricity(household, true);
      } else {
        household.connectionsWithElectricity.add(powerPlant.id);
      }
    }
  }

  connectHouseholdToHousehold(household1, household2) {
    if (!this.households.has(household1) || !this.households.has(household2)) {
      throw new Error("Invalid Household");
    }

    household1.connectionsHousehold.add(household2.id);
    household2.connectionsHousehold.add(household1.id);

    if (household1.connectionsWithElectricity.size > 0 || household2.connectionsWithElectricity.size > 0) {
      if (household1.connectionsWithElectricity.size === 0) {
        household1.connectionsWithElectricity.add(household2.id);
        household2.connectionsWithElectricity.add(household1.id);
        this.householdUpdateElectricity(household1, true);
      }
      if (household2.connectionsWithElectricity.size === 0) {
        household1.connectionsWithElectricity.add(household2.id);
        household2.connectionsWithElectricity.add(household1.id);
        this.householdUpdateElectricity(household2, true);
      }
    }
  }

  disconnectHouseholdFromPowerPlant(household, powerPlant) {
    if (!this.households.has(household) || !this.powerPlants.has(powerPlant)) {
      throw new Error("Invalid Household or PowerPlant");
    }
    household.connectionsPowerPlan.delete(powerPlant.id)
    household.connectionsWithElectricity.delete(powerPlant.id)
    powerPlant.connections.delete(household.id)
    if (household.connectionsWithElectricity.size === 0) {
      this.householdUpdateElectricity(household, false);
    }
  }

  householdUpdateElectricity(household, isRepair = false) {
    if (isRepair) {
      for (const value of household.connectionsHousehold) household.connectionsWithElectricity.add(value)
    }  else {
      household.connectionsWithElectricity = new Set();
    }
    const checkedHouseholdIdList = new Set([household.id]);
    let householdListForCheck = new Set([...household.connectionsHousehold]);

    while (!this.hasAllValues(householdListForCheck, checkedHouseholdIdList)) {
      for (const householdId of householdListForCheck.values()) {
        const householdItem = this.findHouseholdById(householdId);
        if (!checkedHouseholdIdList.has(householdId)) {
          if (isRepair) {
            for (const value of householdItem.connectionsHousehold) householdItem.connectionsWithElectricity.add(value);
          } else {
            householdItem.connectionsWithElectricity = new Set()
          }

          checkedHouseholdIdList.add(householdId);
          householdListForCheck.delete(householdId)
          householdListForCheck.add(...householdItem.connectionsHousehold);
        }
      }
    }
  }

  findHouseholdById(id) {
    for (const household of this.households.values()) {
      if (household.id === id) return household
    }
  }

  hasAllValues(set, inSet) {
    for (let value of set) {
      if (!inSet.has(value)) {
        return false;
      }
    }
    return true;
  }

  killPowerPlant(powerPlan) {
    if (!this.powerPlants.has(powerPlan)) {
      throw new Error("Invalid PowerPlant");
    }

    if (!powerPlan.alive) {
      return;
    }

    powerPlan.alive = false;

    if ([...this.powerPlants].every(powerPlan => powerPlan.alive === false)) {
      for (const household of this.households.values()) {
        household.connectionsWithElectricity = new Set();
      }
      return;
    }

    for (const householdId of powerPlan.connections.values()) {
      let household = this.findHouseholdById(householdId);
      if (household) {
        household.connectionsWithElectricity.delete(powerPlan.id)

        if (household.connectionsWithElectricity.size === 0 && household.connectionsHousehold.size > 0) {
          this.householdUpdateElectricity(household, false);
        }
      }
    }
  }

  repairPowerPlant(powerPlan) {
    if (!this.powerPlants.has(powerPlan)) {
      throw new Error("Invalid PowerPlant");
    }

    if (powerPlan.alive) {
      return;
    }

    powerPlan.alive = true;
    for (const householdId of powerPlan.connections.values()) {
      let household = this.findHouseholdById(householdId);
      if (household) {
        if (!this.householdHasElectricity(household)) {
          this.householdUpdateElectricity(household, true);
        }
        household.connectionsWithElectricity.add(powerPlan.id)
      }
    }
  }

  householdHasElectricity(household) {
    if (!this.households.has(household)) {
      throw new Error("Invalid Household");
    }

    return household.connectionsWithElectricity.size > 0;
  }

  uniqueId() {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
  }
}
