'use client'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Prompt, PromptCategory } from "@/types"
import { Edit, Trash2Icon, X } from "lucide-react"
import { useState } from "react"
import { deletePromptCategory, editPromptCategory } from "@/lib/actions/prompt.categories"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


export default function CategorySection({
    categories,
    editingPrompt,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    setCategories
}: {
    categories: PromptCategory[],
    editingPrompt?: Prompt,
    newCategoryName: string,
    setNewCategoryName: React.Dispatch<React.SetStateAction<string>>,
    handleAddCategory: (categoryName: string) => void,
    setCategories: React.Dispatch<React.SetStateAction<PromptCategory[]>>
}) {

    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState<boolean>(false);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState<boolean>(false);
    const [promptId, setPromptId] = useState<string>('');
    const [promptName, setPromptName] = useState<string>('');
    const [userText, setUserText] = useState<string>('')
    const [renamedCategory, setRenamedCategory] = useState<string>('')

    async function deleteCategoryHandler() {
        try {
            await deletePromptCategory(promptId)
            setCategories(prev => [...prev.filter(category => category.id !== promptId)])
            setPromptId('')
            setShowDeleteCategoryModal(false)
        } catch (error) {
            console.log('error deleting category ', error)
        }
    }

    async function editCategoryHandler() {
        try {
            await editPromptCategory(promptId, renamedCategory)
            setCategories(prev => [...prev.map(category => category.id === promptId ? {...category, name: renamedCategory} : category)])
            setPromptId('')
            setShowEditCategoryModal(false)
        } catch (error) {
            console.log('error deleting category ', error)
        }
    }

    function showDeleteModalHandler(id: string, name: string) {
        setShowDeleteCategoryModal(true);
        setPromptId(id);
        setPromptName(name)
    }

    function showEditModalHandler(id: string, name: string) {
        setShowEditCategoryModal(true);
        setPromptId(id);
        setPromptName(name)
    }

    return (
        <>
            {/* Modal to confirm DELETE category */}
            <ResponsiveDialog
                setIsOpen={setShowDeleteCategoryModal}
                isOpen={showDeleteCategoryModal}
                title={`Delete Category`}
                description="Confirm you want to delete this category"
            >
                <div className="items-center space-y-4 px-3 pb-2">
                    <p className="text-center"><span className="text-destructive font-bold">Important! </span>Deleting this category will de-categorize all Jots associated with it. You will have to re-categorize them manually.</p>
                    <p className="text-sm font-bold m-0 p-0">Type: &ldquo;delete {promptName.toLowerCase()}&rdquo; to confirm</p>
                    <Input
                        type="text"
                        value={userText}
                        placeholder={`delete ${promptName.toLowerCase()}`}
                        onChange={(e) => setUserText(e.target.value)}
                    />
                    <div className="flex-center">
                        <Button
                            disabled={userText.toLowerCase() !== `delete ${promptName.toLowerCase()}`}
                            onClick={deleteCategoryHandler}
                            variant='destructive'>
                            Delete {promptName}
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>

            {/* Edit Category Modal */}
            <ResponsiveDialog
                setIsOpen={setShowEditCategoryModal}
                isOpen={showEditCategoryModal}
                title={`Edit Category Name`}
                description="Confirm you want to edit this category"
            >
                <div className="items-center space-y-4 px-3 pb-2">
                    <Input
                        name="new-category-name"
                        id="new-category-name"
                        type="text"
                        defaultValue={promptName}
                        onChange={(e) => setRenamedCategory(e.target.value)}
                    />
                    <div className="flex-center">
                        <Button
                            disabled={renamedCategory === ``}

                            onClick={editCategoryHandler}
                        >
                            Update Category
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>



            <p className="text-md font-bold">Category <span className="text-sm font-normal">(optional)</span></p>
            {/* Add category form */}
            <div className="flex-start">
                <Input
                    type="text"
                    placeholder="add new category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="mr-3 mt-3"
                />
                <Button
                    type="button"
                    onClick={() => handleAddCategory(newCategoryName)}
                    className="mt-3"
                >Add Category</Button>
            </div>
            <div className="space-y-3 mt-3">
                {categories?.length > 0 ? (
                    <RadioGroup defaultValue={editingPrompt?.category?.id || 'no-category'} name="prompt-category" id="prompt-category">
                        <div className="flex items-center space-x-2 italic">
                            <RadioGroupItem value='no-category' id='no-category' />
                            <Label htmlFor='no-category'>(none)</Label>
                        </div>
                        {categories.map((category: PromptCategory) => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={category.id} id={category.name} />
                                <Label htmlFor={category.name}>{category.name}</Label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        {/* Ellipse */}
                                        <Edit className="hover:text-input hover:cursor-pointer" size={15} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => showEditModalHandler(category.id, category.name)} className="hover:cursor-pointer rounded-md">
                                            <Edit />Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => showDeleteModalHandler(category.id, category.name)} className="hover:cursor-pointer text-destructive rounded-md">
                                            <Trash2Icon />Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </RadioGroup>
                ) : (
                    <p className="text-sm text-center">No Categories Made</p>
                )}
            </div>
        </>
    )
}
