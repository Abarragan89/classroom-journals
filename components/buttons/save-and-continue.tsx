import { BarLoader } from "react-spinners"
import { Button } from "../ui/button";

interface Props {
    isSaving: boolean;
    submitHandler: () => void;
}

export default function SaveAndContinueBtns({ submitHandler, isSaving }: Props) {
    return (
        <div className="flex justify-between w-[270px] mx-auto pb-[100px]">
            <Button
                variant='secondary'
                type="button"
                onClick={submitHandler}
            >
                {isSaving ?
                    <BarLoader
                        color={'white'}
                        width={30}
                        height={2}
                        loading={isSaving}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        className="mb-1"
                    />
                    :

                    'Save'}
            </Button>
            <Button
                variant='default'
                type="submit"
            >
                Save and Continue
            </Button>
        </div>
    )
}
