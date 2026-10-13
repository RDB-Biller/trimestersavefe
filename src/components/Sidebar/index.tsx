import SVGs from "helpers/SVGs"
import { Link, useLocation } from "react-router-dom"
import { useState } from 'react'
import placeholder from "assets/images/pl.svg"

type sidebarType = {
    id:React.Key | null | undefined,
    title:String,
    svg:JSX.Element,
    svg_fill:JSX.Element,
    location:String
}

const Sidebar = () => {

    const location = useLocation()
    const [ open, toggle] = useState(true)

    const sidebar:Array<sidebarType> = [
        {
            id: 1,
            title: 'Dashboard',
            svg: SVGs.grid,
            svg_fill: SVGs.grid_fill,
            location: ''
        },
        {
            id: 2,
            title: 'Budget',
            svg: SVGs.piggy,
            svg_fill: SVGs.piggy_fill,
            location: '/budget'
        },
        {
            id: 6,
            title: 'Savings plans',
            svg: SVGs.piggy,
            svg_fill: SVGs.piggy_fill,
            location: '/birthprep'
        },
        {
            id: 7,
            title: 'Appointments',
            svg: SVGs.calendar,
            svg_fill: SVGs.calendar_fill,
            location: '/appointments'
        },
        {
            id: 3, 
            title: 'Report',
            svg: SVGs.file,
            svg_fill: SVGs.file_fill,
            location: '/report'
        },
        {
            id: 4,
            title: 'Vault',
            svg: SVGs.safe,
            svg_fill: SVGs.safe_fill,
            location: '/vault'
        },
        {
            id: 5,
            title: 'Settings',
            svg: SVGs.gear,
            svg_fill: SVGs.gear_fill,
            location: '/settings'
        },
    ]

    return(
        <div className={` bg-[#ffffff] border-r h-screen transition-all z-10 ${ open ? 'w-72 p-6 absolute z-10 md:relative' : "w-1 px-3 py-6 absolute" } `}  >
            <div onClick={()=>toggle(!open)} className="absolute cursor-pointer bg-[#fff] rounded-full w-8 flex items-center justify-center border h-8 -right-4" >
                { open ? SVGs.arrow_left_small : SVGs.arrow_right_small}
            </div>
            <div className={`w-fit overflow-hidden ${ !open && "hidden" } `} >
                <div className="mt-20" >
                    <div className="w-24 h-24 mx-auto rounded-full bg-white" >
                        <img src={placeholder} alt="" />
                    </div>
                    <div className="text-center mt-6" >
                        <h5>TMS Afriyie</h5>
                        <p className="text-light_grey_text text-xs" ></p>
                    </div>
                </div>
                <div className="p-10 mt-10 " >
                    {
                        sidebar.map((data:sidebarType) => (
                            <Link key={data.id} to={`/dashboard${data.location}`} className={`flex gap-4 mb-10 text-light_grey_text items-center`} >
                                { location.pathname === `/dashboard`+data.location ? <span>{ data.svg_fill }</span> : <span>{ data.svg }</span> }
                                <p className={` ${location.pathname === `/dashboard`+data.location ? 'text-primary font-semibold' : 'text-light_grey_text'} `} >{data.title}</p>
                            </Link>
                        ))
                    }
                </div>

            </div>
        </div>
    )
}

export default Sidebar
