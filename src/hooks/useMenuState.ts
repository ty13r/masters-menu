"use client";

import { useState, useCallback } from "react";
import type { MenuData, Dish } from "@/lib/menu-data";
import { defaultMenu } from "@/lib/menu-data";

export function useMenuState(initial?: MenuData) {
  const [menu, setMenu] = useState<MenuData>(initial ?? defaultMenu);

  const updateField = useCallback(
    <K extends keyof MenuData>(field: K, value: MenuData[K]) => {
      setMenu((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateAppetizer = useCallback((index: number, dish: Dish) => {
    setMenu((prev) => {
      const appetizers = [...prev.appetizers];
      appetizers[index] = dish;
      return { ...prev, appetizers };
    });
  }, []);

  const updateMainCourse = useCallback((index: number, dish: Dish) => {
    setMenu((prev) => {
      const mainCourses = [...prev.mainCourses];
      mainCourses[index] = dish;
      return { ...prev, mainCourses };
    });
  }, []);

  const updateWine = useCallback((index: number, value: string) => {
    setMenu((prev) => {
      const wines = [...prev.wines];
      wines[index] = value;
      return { ...prev, wines };
    });
  }, []);

  return { menu, setMenu, updateField, updateAppetizer, updateMainCourse, updateWine };
}
