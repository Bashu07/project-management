import { Inngest } from "inngest";
import prisma from "../config/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

// Inngest  function to save the user data to the database
const syncUsercreation = inngest.createFunction(
    {id:'sync-user-from-clerk'},
    {event : 'clerk/user.created'},
    async({event})=>{
        const {data} = event
        await prisma.user.create({
            data: {
                id:data.id,
                email: data?.email_addresses[0]?.email_address,
                name:data?.first_name + " " + data?.last_name,
                image:data?.image_url,

            }
        })
    }
)

// inngest function to delete the user from database
const syncUserDeletion = inngest.createFunction(
    {id:'deete-user-from-clerk'},
    {event : 'clerk/user.deleted'},
    async({event})=>{
        const {data} = event
        await prisma.user.delete({
           where: {
            id:data.id
           }
        })
    }
)

// Inngest function to update the user in database
const syncUserUpdation = inngest.createFunction(
    {id:'update-user-from-clerk'},
    {event : 'clerk/user.updated'},
    async({event})=>{
        const {data} = event
        await prisma.user.update({
            where:{
                id:data.id
            },
            data: {
               
                email: data?.email_addresses[0]?.email_address,
                name:data?.first_name + " " + data?.last_name,
                image:data?.image_url,

            }
        })
    }
)

// inngest function to save workspace data to a database
const syncWorkSpaceCreation = inngest.createFunction(
    {id:'sync-workspace-from-clerk '},
    {event:'clerk/organization.created'},
    async ({event})=>{
        const {data} = event 
        await prisma.workspace.create({
            data:{
                id:data.id,
                name:data.name,
                slug:data.slug,
                ownerId:data.created_by,
                image_url:data.image_url,
            }
        })

        // Add creator as admin member
        await prisma.workspaceMember.create({
            data:{
                userId:data.created_by,
                workspaceId:data.Id,
                role: "ADMIN"
            }
        })
    }
)

// Inngest Function ro update the workspace data in database
const syncWorkSpaceUpdation = inngest.createFunction(
    {id:'update-workspace-from-clerk'},
    {event:'clerk/organization.updated'},
    async({event})=>{
        const {data} = event
        await prisma.workspace.update({
            where:{
                id:data.id
            },
            data:{
                name:'data.name',
                slug:data.slug,
                image_url:data.image_url,
            }
        })
    }
)

// Inngest function to delete from database
const syncWorkSpaceDeletion = inngest.createFunction(
    {id:'delete-workspace-with-clerk'},
    {event:'clerk/organization.deleted'},
    async({event})=>{
        const {data} = event
        await prisma.workspace.delete({
            where:{
                id:data.id
            }
        })
    }
)

// Inngest function to save the workspace member data to the database
const syncWorkSpaceMemberCreation = inngest.createFunction(
    {id:'sync-workspace-member-from-clerk'},
    {event:'clerk/OrganizationInvitation.accepted'}
)
async({event})=>{
    const {data} =event;
    await prisma.workspaceMember.create({
        data:{
            userId:data.user_id,
            workspaceId:data.organization_id,
            role:String(data.role_name).toUpperCase()
        }
    })
}

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUsercreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkSpaceCreation,
    syncWorkSpaceUpdation,
    syncWorkSpaceDeletion,
    syncWorkSpaceMemberCreation,
    

];