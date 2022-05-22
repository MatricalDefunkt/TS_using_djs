const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const Infraction = require( '../../../utils/Infraction.js' );
const { rules } = require( '../../../utils/rules.json' );

module.exports = {
    data: {
        name: 'undo',
        parent: 'ban'
    },
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {

        const unbanId = interaction.options.getString( 'user-id' )
        if ( unbanId.length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )
        const reason = interaction.options.getString( 'reason' )

        interaction.guild.bans.fetch( unbanId ).then( unbanUser =>
        {
            interaction.editReply( { content: `Unbanning <@${ unbanId }>` } )
            interaction.guild.bans.remove( unbanId, `${ interaction.user.tag } || ${ reason }` ).then( async ( unbannedUser ) =>
            {
                interaction.editReply( { content: `Unbanned ${ unbannedUser }.` } )
                const infraction = new Infraction()
                await infraction.addUnBan( interaction.user.id, unbanUser.user.id, reason )
                const dbcaseId = infraction.unban.getDataValue( 'caseID' );
                const dbtype = infraction.unban.getDataValue( 'type' );
                const dbtarget = `<@${ infraction.unban.getDataValue( 'targetID' ) }>`;
                const dbmod = `<@${ infraction.unban.getDataValue( 'modID' ) }>`;
                const dbreason = infraction.unban.getDataValue( 'reason' );
                const dbtime = `<t:${ Math.trunc( Date.parse( infraction.unban.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

                const embed = new MessageEmbed()
                    .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
                    .setColor( 'YELLOW' )
                    .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }` )
                    .setFooter({iconURL: interaction.user.avatarURL(), text: interaction.user.tag})
                    .setTimestamp()
                return;

            } ).catch( ( err ) =>
            {
                console.error( err );
                interaction.editReply( { content: `There was an error, please contact Matrical ASAP.` } )

            } );

        } ).catch( ( err ) =>
        {

            if ( err.code === 10026 ) return interaction.editReply( { content: `<@${ unbanId }> has not been banned in the first place.` } )
            interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
            console.error( err );

        } );

        return
    }
}