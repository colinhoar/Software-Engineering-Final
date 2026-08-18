import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "../../shadcn/ui/sidebar.tsx"
import Form from '../components/map/Form_Map';

interface Props {
    gMapsApiStatus: boolean;
    setMapDirections(directions: google.maps.DirectionsResult): void;
}
// Sidebar rendered here
export default function AppSidebar({ gMapsApiStatus, setMapDirections }: Props) {
    return(
        <div>
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent>
                        <SidebarGroup>
                            <Form
                                gMapsApiStatus={gMapsApiStatus}
                                setMapDirections={setMapDirections}
                            />
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>
        </div>
    )
}