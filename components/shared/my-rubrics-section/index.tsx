"use client"

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MyRubricSection() {
    const [scoreLevels, setScoreLevels] = useState(["1", "2", "3"]);
    const [categories, setCategories] = useState([
        { name: "Category 1", criteriaByScore: ["", "", ""] }
    ]);

    const addCategory = () => {
        setCategories([
            ...categories,
            { name: `Category ${categories.length + 1}`, criteriaByScore: Array(scoreLevels.length).fill("") }
        ]);
    };

    const addScoreLevel = () => {
        setScoreLevels([...scoreLevels, (scoreLevels.length + 1).toString()]);
        setCategories(categories.map(cat => ({
            ...cat,
            criteriaByScore: [...cat.criteriaByScore, ""]
        })));
    };

    const updateCategoryName = (index: number, value: string) => {
        const newCategories = [...categories];
        newCategories[index].name = value;
        setCategories(newCategories);
    };

    const updateCriteria = (catIdx: number, scoreIdx: number, value: string) => {
        const newCategories = [...categories];
        newCategories[catIdx].criteriaByScore[scoreIdx] = value;
        setCategories(newCategories);
    };

    return (
        <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl mb-4">Rubric Builder</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableCaption>Create and customize your grading rubric.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            {scoreLevels.map((level, idx) => (
                                <TableHead key={idx}>Score {level}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category, catIdx) => (
                            <TableRow key={catIdx}>
                                <TableCell className="font-medium">
                                    <Input
                                        value={category.name}
                                        onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                                    />
                                </TableCell>
                                {category.criteriaByScore.map((criteria, scoreIdx) => (
                                    <TableCell key={scoreIdx}>
                                        <Input
                                            value={criteria}
                                            onChange={(e) => updateCriteria(catIdx, scoreIdx, e.target.value)}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex gap-4 mt-4">
                <Button onClick={addCategory}>Add Category</Button>
                <Button onClick={addScoreLevel}>Add Score Level</Button>
            </div>
        </div>
    );
}
